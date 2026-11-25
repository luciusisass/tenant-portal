'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MaintenanceRequest() {
  const [locationType, setLocationType] = useState('My Unit')
  const [propertyArea, setPropertyArea] = useState('2-Bedroom Block')
  const [specificLocation, setSpecificLocation] = useState('Unit 1')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  // This handles changing the options based on the property area selected
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const area = e.target.value
    setPropertyArea(area)
    
    // Reset the specific location to a valid default when they change the area
    if (area === '2-Bedroom Block') setSpecificLocation('Unit 1')
    else if (area === 'Single Quarters') setSpecificLocation('Building A - Upstairs Left')
    else if (area === '4-Bedroom House') setSpecificLocation('Whole House')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('maintenance_requests').insert({
      location_type: locationType,
      property_area: propertyArea,
      specific_location: specificLocation,
      description: description,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Request submitted successfully!')
      setDescription('')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Submit a Maintenance Request</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block mb-1 text-sm font-medium">What needs fixing?</label>
            <select 
              value={locationType} 
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="My Unit">My Private Space (Unit / Room / House)</option>
              <option value="Common Area">Common Area (Kitchen / Restroom)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Property Area</label>
            <select 
              value={propertyArea} 
              onChange={handleAreaChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="2-Bedroom Block">2-Bedroom Blocks (3 Buildings)</option>
              <option value="Single Quarters">Single Quarters (32 Rooms)</option>
              <option value="4-Bedroom House">4-Bedroom House</option>
            </select>
          </div>

          {/* Hide specific location if it's the whole house */}
          {propertyArea !== '4-Bedroom House' && (
            <div>
              <label className="block mb-1 text-sm font-medium">Specific Location</label>
              <select 
                value={specificLocation} 
                onChange={(e) => setSpecificLocation(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {propertyArea === '2-Bedroom Block' && (
                  <>
                    <option value="Unit 1">Unit 1</option>
                    <option value="Unit 2">Unit 2</option>
                    <option value="Unit 3">Unit 3</option>
                    <option value="Unit 4">Unit 4</option>
                    <option value="Unit 5">Unit 5</option>
                    <option value="Unit 6">Unit 6</option>
                  </>
                )}

                {propertyArea === 'Single Quarters' && (
                  <>
                    <option value="Building A - Upstairs Left">Building A - Upstairs Left</option>
                    <option value="Building A - Upstairs Right">Building A - Upstairs Right</option>
                    <option value="Building A - Downstairs Left">Building A - Downstairs Left</option>
                    <option value="Building A - Downstairs Right">Building A - Downstairs Right</option>
                    
                    <option value="Building B - Upstairs Left">Building B - Upstairs Left</option>
                    <option value="Building B - Upstairs Right">Building B - Upstairs Right</option>
                    <option value="Building B - Downstairs Left">Building B - Downstairs Left</option>
                    <option value="Building B - Downstairs Right">Building B - Downstairs Right</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the issue (e.g., Leaking tap, broken window...)"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 h-24"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>

          {message && (
            <p className={`mt-2 text-center text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
        </form>
        
        <button 
          onClick={() => router.push('/')}
          className="mt-6 text-sm text-gray-400 hover:text-white w-full text-center"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  )
}
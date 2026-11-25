'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UploadReceipt() {
  const [unitNumber, setUnitNumber] = useState('')
  const [paymentPlan, setPaymentPlan] = useState('Monthly') // Monthly or Fortnightly
  const [paymentPeriod, setPaymentPeriod] = useState('') // e.g., "November 2024" or "Week 1"
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage('Please select a file to upload.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      // 3. Save to Database
      const { error: dbError } = await supabase.from('receipts').insert({
        unit_number: unitNumber,
        month_paid: paymentPeriod, // We'll use this column to store both "Nov" or "Week 1"
        image_url: publicUrl,
      })

      if (dbError) throw dbError

      setMessage('Receipt uploaded successfully!')
      setFile(null)
      setUnitNumber('')
      setPaymentPeriod('')
      
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Upload Payment Receipt</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block mb-1 text-sm font-medium">Unit / Room Number</label>
            <input 
              type="text"
              required
              placeholder="e.g., Unit 1, B-A Upstairs, House"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Payment Plan</label>
            <select 
              value={paymentPlan}
              onChange={(e) => {
                setPaymentPlan(e.target.value)
                setPaymentPeriod('') // Reset period when they switch plans
              }}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="Monthly">Monthly (2-Bedroom / House)</option>
              <option value="Fortnightly">Fortnightly (Single Quarters)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Payment Period</label>
            {paymentPlan === 'Monthly' ? (
              <input 
                type="month" // Gives them a nice calendar picker
                required
                value={paymentPeriod}
                onChange={(e) => setPaymentPeriod(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <input 
                type="text"
                required
                placeholder="e.g., Fortnight of Nov 15"
                value={paymentPeriod}
                onChange={(e) => setPaymentPeriod(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Receipt Image (JPG/PNG)</label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Receipt'}
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
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'maintenance' | 'receipts' | 'announcements'>('maintenance')
  
  // Data states
  const [requests, setRequests] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Announcement form states
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const savedPin = sessionStorage.getItem('admin_pin')
    if (savedPin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      setIsAuthenticated(true)
      fetchData()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      sessionStorage.setItem('admin_pin', pin)
      setIsAuthenticated(true)
      fetchData()
    } else {
      alert('Incorrect PIN')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch Maintenance
    const { data: reqData } = await supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (reqData) setRequests(reqData)

    // Fetch Receipts
    const { data: recData } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
    if (recData) setReceipts(recData)

    // Fetch Announcements
    const { data: annData } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (annData) setAnnouncements(annData)

    setLoading(false)
  }

  const markAsResolved = async (id: number) => {
    const { error } = await supabase
      .from('maintenance_requests')
      .update({ status: 'Resolved' })
      .eq('id', id)

    if (!error) {
      setRequests(requests.map(req => req.id === id ? { ...req, status: 'Resolved' } : req))
    }
  }

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('announcements').insert({
      title: newTitle,
      message: newMessage,
    })
    
    if (!error) {
      setNewTitle('')
      setNewMessage('')
      fetchData() // Refresh the list
    } else {
      alert('Error posting announcement')
    }
  }

  // --- RENDER LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Enter Admin PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-center text-xl tracking-widest"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => { sessionStorage.removeItem('admin_pin'); setIsAuthenticated(false); }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('maintenance')}
            className={`pb-2 px-2 font-bold whitespace-nowrap ${activeTab === 'maintenance' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Maintenance Requests
          </button>
          <button 
            onClick={() => setActiveTab('receipts')}
            className={`pb-2 px-2 font-bold whitespace-nowrap ${activeTab === 'receipts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Payment Receipts
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`pb-2 px-2 font-bold whitespace-nowrap ${activeTab === 'announcements' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Announcements
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : activeTab === 'maintenance' ? (
          
          // --- MAINTENANCE VIEW ---
          requests.length === 0 ? (
            <p className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">No maintenance requests yet.</p>
          ) : (
            <div className="grid gap-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded text-blue-300 font-bold">
                        {req.property_area} &bull; {req.specific_location}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${req.status === 'Resolved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-lg font-medium">{req.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      <strong>Fixing:</strong> {req.location_type} | <strong>Date:</strong> {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {req.status !== 'Resolved' && (
                    <button 
                      onClick={() => markAsResolved(req.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors whitespace-nowrap"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )

        ) : activeTab === 'receipts' ? (
          
          // --- RECEIPTS VIEW ---
          receipts.length === 0 ? (
            <p className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">No receipts uploaded yet.</p>
          ) : (
            <div className="grid gap-4">
              {receipts.map((rec) => (
                <div key={rec.id} className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded text-green-300 font-bold">
                        Unit: {rec.unit_number}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {rec.month_paid}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Uploaded: {new Date(rec.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <a 
                    href={rec.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors whitespace-nowrap text-center"
                  >
                    View Receipt Image
                  </a>
                </div>
              ))}
            </div>
          )

        ) : (
          
          // --- ANNOUNCEMENTS VIEW ---
          <div>
            <form onSubmit={postAnnouncement} className="bg-gray-800 p-6 rounded-lg mb-6 flex flex-col gap-4 shadow">
              <h3 className="font-bold text-lg">Post New Announcement</h3>
              <input 
                type="text" 
                placeholder="Title (e.g., Water Shutoff)" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <textarea 
                placeholder="Message" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 h-24"
              />
              <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded self-end">
                Post Announcement
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {announcements.length === 0 ? (
                <p className="text-center text-gray-400">No announcements posted yet.</p>
              ) : (
                announcements.map((item) => (
                  <div key={item.id} className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500 shadow">
                    <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                    <p className="text-gray-300 whitespace-pre-wrap">{item.message}</p>
                    <p className="text-xs text-gray-500 mt-4">Posted: {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
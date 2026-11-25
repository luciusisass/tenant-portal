'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TenantAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setAnnouncements(data)
      setLoading(false)
    }
    fetchAnnouncements()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Announcements</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-400 bg-gray-800 p-6 rounded-lg">No announcements right now.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map((item) => (
              <div key={item.id} className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500">
                <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{item.message}</p>
                <p className="text-xs text-gray-500 mt-4">
                  Posted on {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => router.push('/')}
          className="mt-8 text-sm text-gray-400 hover:text-white"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  )
}
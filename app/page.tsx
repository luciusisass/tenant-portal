'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/') // Fixed: goes back to homepage after logout
  }

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        
        <h1 className="text-3xl font-bold mb-2">Tenant Portal</h1>
        
        {user ? (
          <p className="text-gray-400 mb-8">Welcome back, {user.email}</p>
        ) : (
          <p className="text-gray-400 mb-8">Please log in to manage your property.</p>
        )}

        <div className="flex flex-col gap-4">
          
          <button 
            onClick={() => router.push('/maintenance')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            🔧 Submit Maintenance Request
          </button>

          <button 
            onClick={() => router.push('/receipts')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            🧾 Upload Payment Receipt
          </button>

          <button 
            onClick={() => router.push('/announcements')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            📢 View Announcements
          </button>

        </div>

        {user ? (
          <button 
            onClick={handleLogout}
            className="mt-8 text-sm text-red-400 hover:text-red-300 w-full text-center"
          >
            Log out
          </button>
        ) : (
          <button 
            onClick={() => router.push('/auth/login')} // Fixed: points to the correct Supabase auth route
            className="mt-8 bg-white text-gray-900 font-bold py-2 px-4 rounded w-full hover:bg-gray-200"
          >
            Log In
          </button>
        )}

      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaUser, FaHistory, FaEdit, FaBook, FaBookmark, FaSignOutAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: ''
  })

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      setFormData({
        displayName: session.user?.name || '',
        bio: '',
        avatarUrl: session.user?.image || ''
      })
    }
  }, [session, router])

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.displayName,
          image: formData.avatarUrl
        }
      })

      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex items-start gap-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image
              src={formData.avatarUrl || '/default-avatar.png'}
              alt={formData.displayName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium mb-1"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="avatarUrl"
                    className="block text-sm font-medium mb-1"
                  >
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{formData.displayName}</h1>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setEditing(true)}
                      className="text-gray-400 hover:text-white"
                      title="Edit Profile"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      title="Logout"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 mt-2">{formData.bio || 'No bio yet'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-4">Reading Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <FaBook />
              <span>Total Books</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <FaBookmark />
              <span>Bookmarks</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <FaHistory />
              <span>Reading Time</span>
            </div>
            <p className="text-2xl font-bold">0h</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
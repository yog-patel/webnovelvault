'use client'

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaUser, FaHistory, FaEdit, FaBook, FaBookmark, FaSignOutAlt, FaComment } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [bookmarks, setBookmarks] = useState([])
  const [comments, setComments] = useState([])
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: ''
  })

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      fetchUserProfile()
      fetchBookmarks()
      fetchComments()
    }
  }, [session, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setFormData({
        displayName: data.displayName || session.user?.name || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || session.user?.image || ''
      })
    } catch (error) {
      toast.error('Failed to load profile')
    }
  }

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (!response.ok) throw new Error('Failed to fetch bookmarks')
      const data = await response.json()
      setBookmarks(data)
    } catch (error) {
      toast.error('Failed to load bookmarks')
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/user/${session?.user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (error) {
      toast.error('Failed to load comments')
    }
  }

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
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.displayName,
          image: updatedUser.avatarUrl
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
              src={formData.avatarUrl || '/images/default-avatar.svg'}
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
            <p className="text-2xl font-bold">{bookmarks.length}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <FaBookmark />
              <span>Bookmarks</span>
            </div>
            <p className="text-2xl font-bold">{bookmarks.length}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <FaComment />
              <span>Comments</span>
            </div>
            <p className="text-2xl font-bold">{comments.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'profile'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'bookmarks'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Bookmarks
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'comments'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Comments
          </button>
        </div>

        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            {bookmarks.length === 0 ? (
              <p className="text-gray-400">No bookmarks yet</p>
            ) : (
              bookmarks.map((bookmark) => (
                <div
                  key={bookmark.bookmark_id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  <Link href={`/novels/${bookmark.novels.slug}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-24">
                        <Image
                          src={bookmark.novels.cover_image_url || '/default-cover.png'}
                          alt={bookmark.novels.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{bookmark.novels.title}</h3>
                        <p className="text-gray-400">
                          Progress: {bookmark.progress}% ({bookmark.chapters?.chapter_number || 0}/{bookmark.total_chapters})
                        </p>
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date(bookmark.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-400">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={comment.users.avatar_url || '/images/default-avatar.svg'}
                        alt={comment.users.display_name || comment.users.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{comment.users.display_name || comment.users.username}</span>
                        <span className="text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                      <Link
                        href={`/novels/${comment.novels.slug}`}
                        className="text-purple-400 hover:text-purple-300 mt-2 inline-block"
                      >
                        View on {comment.novels.title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
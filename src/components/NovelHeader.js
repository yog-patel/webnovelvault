'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { FaBookmark, FaStar, FaClock } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function NovelHeader({ novel }) {
  const { data: session } = useSession()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [rating, setRating] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastReadChapter, setLastReadChapter] = useState(null)

  useEffect(() => {
    const fetchBookmarkInfo = async () => {
      if (!novel) return;
      if (session) {
        try {
          const response = await fetch(`/api/bookmarks/${novel.novel_id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch bookmark info')
          }
          const data = await response.json()
          if (data) {
            setIsBookmarked(true)
            setLastReadChapter(data.chapters)
          }
        } catch (error) {
          console.error('Error fetching bookmark:', error)
        }
      } else {
        // Guest: use localStorage
        try {
          const key = `novelreader_last_read_chapter_${novel.novel_id}`;
          const stored = localStorage.getItem(key);
          if (stored) {
            setLastReadChapter(JSON.parse(stored));
          }
        } catch (e) {
          // ignore
        }
      }
    }
    fetchBookmarkInfo()
  }, [novel, session])

  useEffect(() => {
    if (novel?.ratings?.some(r => r.user_id === session?.user?.id)) {
      const userRating = novel.ratings.find(r => r.user_id === session?.user?.id)
      setRating(userRating?.score || 0)
    }
  }, [novel, session])

  const handleBookmark = async () => {
    if (!session) {
      toast.error('Please login to bookmark novels')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ novel_id: novel.novel_id })
      })

      if (!response.ok) {
        throw new Error('Failed to update bookmark')
      }

      setIsBookmarked(!isBookmarked)
      if (!isBookmarked) {
        setLastReadChapter(null)
      }
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    } catch (error) {
      console.error('Bookmark error:', error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRating = async (score) => {
    if (!session) {
      toast.error('Please login to rate novels')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ novelId: novel.novel_id, score })
      })

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      setRating(score)
      toast.success('Rating submitted successfully')
    } catch (error) {
      console.error('Rating error:', error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!novel) {
    return <div className="bg-gray-800 rounded-lg p-6">Loading...</div>
  }

  // Calculate the latest chapter number and get last update time
  const latestChapter = novel.chapters?.length > 0 
    ? novel.chapters.reduce((latest, current) => 
        latest.chapter_number > current.chapter_number ? latest : current
      )
    : null

  // Get the first chapter for the Start Reading button
  const firstChapter = novel.chapters?.length > 0
    ? novel.chapters.reduce((first, current) => 
        first.chapter_number < current.chapter_number ? first : current
      )
    : null

  const getLastUpdateText = () => {
    if (!latestChapter?.created_at) return 'No updates yet'
    
    const now = new Date()
    const updateDate = new Date(latestChapter.created_at)
    const diffTime = Math.abs(now - updateDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 30) {
      return `${diffDays}d ago`
    } else {
      return updateDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Calculate chapters per week
  const getChaptersPerWeek = () => {
    if (!novel.chapters || novel.chapters.length === 0) return 0
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const chaptersLastWeek = novel.chapters.filter(chapter => 
      new Date(chapter.created_at) > oneWeekAgo
    ).length

    return chaptersLastWeek
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Cover Image */}
        <div className="md:w-1/4">
          <div className="relative aspect-[2/3] w-full">
            {!imageError ? (
              <Image
                src={novel.cover_image_url || '/placeholder-cover.jpg'}
                alt={`${novel.title} cover`}
                fill
                className="object-cover rounded-lg"
                onError={() => setImageError(true)}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">No cover image</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Novel Information */}
        <div className="md:w-3/4">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              novel.status === 'completed' 
                ? 'bg-indigo-900 text-indigo-100'
                : 'bg-purple-900 text-purple-100'
            }`}>
              {novel.status === 'completed' ? 'COMPLETED' : 'ONGOING'}
            </span>
          </div>

          {/* Title and Rating */}
          <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`text-2xl ${
                    star <= (rating || novel.average_rating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-600'
                  }`}
                >
                  <FaStar />
                </button>
              ))}
              <span className="ml-2 text-lg font-medium">
                {novel.average_rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-400">
                ({novel.ratings_count || 0} votes)
              </span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-6">
            {novel.novel_genres?.map(({ genres }) => (
              <Link
                key={genres.genre_id}
                href={`/novels?genre=${genres.name}`}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors"
              >
                {genres.name}
              </Link>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 mb-6 text-gray-300">
            <div className="flex items-center gap-2">
              <span className="font-medium">Chapters:</span>
              <span>{latestChapter?.chapter_number || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-purple-400" />
              <span>{getLastUpdateText()} ({getChaptersPerWeek()} new ch/week)</span>
            </div>
          </div>

          {/* Author */}
          <div className="flex flex-wrap gap-6 mb-6 text-gray-300">
            <div>
              <span className="text-gray-400">Author: </span>
              <span className="text-white">{novel.author}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {lastReadChapter ? (
              <Link
                href={`/novels/${novel.slug}/chapters/${lastReadChapter.chapter_id}`}
                className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 transition-colors"
              >
                CONTINUE READING
                <span className="text-sm ml-2">
                  (Ch. {lastReadChapter.chapter_number})
                </span>
              </Link>
            ) : (
              <Link
                href={firstChapter ? `/novels/${novel.slug}/chapters/${firstChapter.chapter_id}` : '#'}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  firstChapter
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                START READING
              </Link>
            )}
            <button
              onClick={handleBookmark}
              disabled={isLoading}
              className={`px-6 py-3 rounded-md transition-colors font-medium ${
                isBookmarked
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
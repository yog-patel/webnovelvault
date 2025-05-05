'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FaLock, FaEye, FaClock } from 'react-icons/fa'

export default function ChapterList({ chapters = [], novelSlug }) {
  const { data: session } = useSession()
  const sortedChapters = [...chapters].sort((a, b) => b.chapter_number - a.chapter_number)
  const latestChapter = sortedChapters[0]

  const cleanChapterTitle = (title, chapterNumber) => {
    if (!title) return null
    // Remove "Chapter X:" or "Chapter X :" prefix if it exists
    const regex = new RegExp(`^Chapter ${chapterNumber}:?\\s*`, 'i')
    return title.replace(regex, '').trim()
  }

  if (!novelSlug) {
    return <div className="text-gray-400">No novel slug provided</div>
  }

  if (!chapters || chapters.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 text-center">
        <p className="text-gray-400">No chapters available yet</p>
      </div>
    )
  }

  const formatDate = (date) => {
    const now = new Date()
    const chapterDate = new Date(date)
    const diffTime = Math.abs(now - chapterDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays < 30) {
      return `${diffDays} days ago`
    } else {
      return chapterDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Latest Chapter */}
      {latestChapter && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-purple-400 mb-2">Latest:</p>
          <Link 
            href={`/novels/${novelSlug}/chapters/${latestChapter.chapter_id}`}
            className="text-lg text-white hover:text-purple-400 transition-colors line-clamp-1"
          >
            {latestChapter.title || `Chapter ${latestChapter.chapter_number}`}
          </Link>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <FaClock className="text-purple-400" />
              {formatDate(latestChapter.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <FaEye className="text-purple-400" />
              {latestChapter.view_count || 0} views
            </div>
          </div>
        </div>
      )}

      {/* Chapters List */}
      <div className="bg-gray-800/50 rounded-lg">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-gray-700">
            {sortedChapters.map((chapter) => (
              <div 
                key={chapter.chapter_id} 
                className="p-4 hover:bg-gray-700/50 transition-colors"
              >
                <Link 
                  href={`/novels/${novelSlug}/chapters/${chapter.chapter_id}`}
                  className="block"
                  aria-label={`Chapter ${chapter.chapter_number}${chapter.title ? `: ${chapter.title}` : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white line-clamp-1">
                        {chapter.title || `Chapter ${chapter.chapter_number}`}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <FaEye className="text-purple-400" />
                          {chapter.view_count || 0} views
                        </div>
                        {chapter.created_at && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <FaClock className="text-purple-400" />
                            {formatDate(chapter.created_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    {!chapter.is_free && !session && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <FaLock className="text-sm" />
                        <span className="text-sm">Premium</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import Image from 'next/image'
// import Link from 'next/link'

// export default function LibraryPage() {
//   const { data: session } = useSession()
//   const [bookmarks, setBookmarks] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [guestLibrary, setGuestLibrary] = useState([])

//   useEffect(() => {
//     // Handle guest library data fetching from localStorage
//     if (!session) {
//       try {
//         const tempGuestLibrary = [];
//         // Gather all keys for last read chapters
//         for (let i = 0; i < localStorage.length; i++) {
//           const key = localStorage.key(i);
//           if (key && key.startsWith('novelreader_last_read_chapter_')) {
//             const novelId = key.replace('novelreader_last_read_chapter_', '');
//             const chapter = JSON.parse(localStorage.getItem(key));
//             // You may want to fetch novel info from an API or cache
//             tempGuestLibrary.push({ novelId, chapter });
//           }
//         }
//         setGuestLibrary(tempGuestLibrary);
//       } catch (e) {
//         // ignore localStorage errors
//         console.error('LocalStorage error:', e);
//       } finally {
//         setLoading(false);
//       }
//     }
//   }, [session]);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!session) return

//       setLoading(true)
//       try {
//         const bookmarksResponse = await fetch('/api/bookmarks')
//         if (!bookmarksResponse.ok) {
//           throw new Error('Failed to fetch bookmarks')
//         }
//         const bookmarksData = await bookmarksResponse.json()
//         setBookmarks(bookmarksData)
//       } catch (error) {
//         console.error('Error fetching data:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [session])

//   const formatTimeAgo = (date) => {
//     const now = new Date()
//     const past = new Date(date)
//     const diffTime = Math.abs(now - past)
//     const diffMinutes = Math.floor(diffTime / (1000 * 60))
//     const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
//     if (diffMinutes < 60) return `${diffMinutes}m ago`
//     if (diffHours < 24) return `${diffHours}h ago`
//     if (diffDays === 0) return 'Today'
//     if (diffDays === 1) return 'Yesterday'
//     if (diffDays < 30) return `${diffDays}d ago`
//     return new Date(date).toLocaleDateString()
//   }

//   const calculateProgress = (item) => {
//     const currentChapter = item.chapters?.chapter_number || 0
//     const totalChapters = item.novels.chapters?.length || 0
//     const percentage = totalChapters > 0 ? (currentChapter / totalChapters * 100).toFixed(1) : '0.0'
//     return {
//       current: currentChapter,
//       total: totalChapters,
//       percentage
//     }
//   }

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 p-8">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-gray-800 rounded-lg p-8">
//             <div className="animate-pulse">
//               <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
//               <div className="space-y-4">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="h-20 bg-gray-700 rounded"></div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Guest view
//   if (!session) {
//     return (
//       <div className="min-h-screen bg-gray-900 p-8">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-gray-800 rounded-lg p-8 text-center">
//             <h1 className="text-2xl font-bold text-white mb-4">Library</h1>
//             {guestLibrary.length === 0 ? (
//               <div className="space-y-4">
//                 <p className="text-gray-400">No reading progress found. Start reading a novel!</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {guestLibrary.map((item) => (
//                   <div key={item.novelId} className="flex items-center justify-between bg-gray-700/50 rounded p-4">
//                     <span className="text-white font-medium">Novel ID: {item.novelId}</span>
//                     <span className="text-gray-300">Last read chapter: {item.chapter.chapter_number}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//             <p className="text-gray-400 mt-4">Login to sync your library across devices.</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Logged in user view
//   const sortedBookmarks = bookmarks.sort((a, b) => new Date(b.novels.updated_at) - new Date(a.novels.updated_at))

//   return (
//     <div className="min-h-screen bg-gray-900 p-8">
//       <div className="max-w-6xl mx-auto space-y-6">
//         <h1 className="text-2xl font-bold text-white">Library</h1>

//         {/* Novels List */}
//         <div className="bg-gray-800/50 rounded-lg">
//           {sortedBookmarks.length === 0 ? (
//             <div className="p-8 text-center text-gray-400">
//               No novels found in your library
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-700">
//               {sortedBookmarks.map((item) => {
//                 const progress = calculateProgress(item)
//                 return (
//                   <div key={item.bookmark_id} className="p-4 hover:bg-gray-700/30 transition-colors">
//                     <div className="flex items-center gap-6">
//                       {/* Novel Cover */}
//                       <Link href={`/novels/${item.novels.slug}`} className="shrink-0">
//                         <div className="relative w-16 h-24">
//                           <Image
//                             src={item.novels.cover_image_url || '/placeholder-cover.jpg'}
//                             alt={item.novels.title}
//                             fill
//                             className="object-cover rounded"
//                             sizes="64px"
//                           />
//                         </div>
//                       </Link>

//                       {/* Novel Info */}
//                       <div className="flex-grow min-w-0">
//                         <Link 
//                           href={`/novels/${item.novels.slug}`}
//                           className="text-lg font-medium text-white hover:text-purple-400 transition-colors line-clamp-1"
//                         >
//                           {item.novels.title}
//                         </Link>
//                         <div className="text-sm text-gray-400 mt-1">
//                           {new Date(item.novels.updated_at).toLocaleDateString()}
//                         </div>
//                       </div>

//                       {/* Progress */}
//                       <div className="text-right shrink-0">
//                         <div className="text-white">
//                           {progress.current} / {progress.total}
//                         </div>
//                         <div className="text-sm text-gray-400">
//                           ({progress.percentage}%)
//                         </div>
//                       </div>

//                       {/* Status */}
//                       <div className="shrink-0 w-32 text-right">
//                         <span className="text-gray-400">{item.novels.status}</span>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function LibraryPage() {
  const { data: session } = useSession()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [guestLibrary, setGuestLibrary] = useState([])

  useEffect(() => {
    // Handle guest library data fetching from localStorage
    if (!session) {
      try {
        const tempGuestLibrary = [];
        // Gather all keys for last read chapters
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('novelreader_last_read_chapter_')) {
            const novelId = key.replace('novelreader_last_read_chapter_', '');
            const chapter = JSON.parse(localStorage.getItem(key));
            // You may want to fetch novel info from an API or cache
            tempGuestLibrary.push({ novelId, chapter });
          }
        }
        setGuestLibrary(tempGuestLibrary);
      } catch (e) {
        // ignore localStorage errors
        console.error('LocalStorage error:', e);
      } finally {
        setLoading(false);
      }
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return

      setLoading(true)
      try {
        const bookmarksResponse = await fetch('/api/bookmarks')
        if (!bookmarksResponse.ok) {
          throw new Error('Failed to fetch bookmarks')
        }
        const bookmarksData = await bookmarksResponse.json()
        setBookmarks(bookmarksData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const formatTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffTime = Math.abs(now - past)
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    // return 'one month ago' // Similar to the reference design
  }

  const calculateProgress = (item) => {
    const currentChapter = item.chapters?.chapter_number || 0
    const totalChapters = item.novels.chapters?.length || 0
    const percentage = totalChapters > 0 ? (currentChapter / totalChapters * 100).toFixed(1) : '0.0'
    return {
      current: currentChapter,
      total: totalChapters,
      percentage
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white my-4">Library</h1>
          <div className="bg-gray-800/50 rounded-lg">
            <div className="animate-pulse">
              <div className="space-y-4 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-700/50 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Guest view
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white my-4">Library</h1>
          <div className="bg-gray-800/50 rounded-lg p-4">
            {guestLibrary.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No reading progress found. Start reading a novel!</p>
                <p className="text-gray-400 mt-4">Login to sync your library across devices.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {guestLibrary.map((item) => (
                  <div key={item.novelId} className="flex flex-col bg-gray-800 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Novel ID: {item.novelId}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-400">Last read: Chapter {item.chapter.chapter_number}</span>
                      <span className="text-green-500">New Chapters</span>
                    </div>
                  </div>
                ))}
                <p className="text-gray-400 text-center mt-4">Login to sync your library across devices.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Logged in user view
  const sortedBookmarks = bookmarks.sort((a, b) => new Date(b.novels.updated_at) - new Date(a.novels.updated_at))

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white my-4">Library</h1>

        {/* Novels List */}
        <div className="bg-gray-800/20 rounded-lg">
          {sortedBookmarks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No novels found in your library
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {sortedBookmarks.map((item) => {
                const progress = calculateProgress(item)
                return (
                  <div key={item.bookmark_id} className="p-3 hover:bg-gray-700/30 transition-colors">
                    <div className="flex gap-3">
                      {/* Novel Cover */}
                      <Link href={`/novels/${item.novels.slug}`} className="shrink-0">
                        <div className="relative w-12 h-16 sm:w-16 sm:h-24 rounded overflow-hidden">
                          <Image
                            src={item.novels.cover_image_url || '/placeholder-cover.jpg'}
                            alt={item.novels.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 48px, 64px"
                          />
                        </div>
                      </Link>

                      {/* Novel Info - Mobile Optimized */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <Link 
                            href={`/novels/${item.novels.slug}`}
                            className="text-base font-medium text-white hover:text-purple-400 transition-colors line-clamp-1"
                          >
                            {item.novels.title}
                          </Link>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            
                            {formatTimeAgo(item.novels.updated_at)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xl text-gray-400">
                            Progress: {progress.current} / {progress.total} ({progress.percentage}%)
                          </div>
                          {/* <div className="text-xs text-green-500 font-medium">
                            New Chapters
                          </div> */}
                        </div>
                      </div>
            
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
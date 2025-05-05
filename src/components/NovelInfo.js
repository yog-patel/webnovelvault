'use client'

import Link from 'next/link'

export default function NovelInfo({ novel }) {
  if (!novel) return null

  // Function to normalize tags and remove duplicates
  const getUniqueTags = () => {
    if (!novel.novel_tags) return []
    
    // Create a Map to store unique tags (case-insensitive)
    const uniqueTags = new Map()
    
    novel.novel_tags.forEach(({ tags }) => {
      const normalizedName = tags.name.toLowerCase()
      // Keep the version of the tag that was first encountered
      if (!uniqueTags.has(normalizedName)) {
        uniqueTags.set(normalizedName, tags)
      }
    })
    
    return Array.from(uniqueTags.values())
  }

  return (
    <div className="space-y-8">
      {/* Synopsis */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <p className="text-gray-300 whitespace-pre-line leading-relaxed">
            {novel.description || 'No description available.'}
          </p>
        </div>
      </div>

      {/* Genres Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {novel.novel_genres?.map(({ genres }) => (
            <Link
              key={genres.genre_id}
              href={`/novels?genre=${genres.name}`}
              className="bg-gray-800/50 text-purple-400 px-3 py-1 rounded-md text-sm hover:bg-gray-700/50 transition-colors"
            >
              {genres.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {getUniqueTags().length > 0 ? (
            getUniqueTags().map((tag) => (
              <Link
                key={tag.tag_id}
                href={`/novels?tag=${tag.name}`}
                className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-700/50 transition-colors"
              >
                {/* Capitalize first letter of each word */}
                {tag.name.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')}
              </Link>
            ))
          ) : (
            <span className="text-gray-500">No tags available</span>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Details</h2>
        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Status</h3>
            <p className="text-white capitalize">{novel.status || 'Unknown'}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Total Chapters</h3>
            <p className="text-white">{novel.chapters?.length || 0}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Views</h3>
            <p className="text-white">{novel.view_count?.toLocaleString() || 0}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Last Updated</h3>
            <p className="text-white">
              {novel.updated_at 
                ? new Date(novel.updated_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
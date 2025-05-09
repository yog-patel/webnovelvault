import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchDropdown({ isOpen, onClose, searchQuery, setSearchQuery }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(debouncedSearchQuery)}`)
        const data = await response.json()
        setSuggestions(data.novels)
      } catch (error) {
        console.error('Error fetching search suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearchQuery])

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
      {isLoading ? (
        <div className="p-4 text-center text-gray-400">
          Loading...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="max-h-96 overflow-y-auto">
          {suggestions.map((novel) => (
            <Link
              key={novel.novel_id}
              href={`/novels/${novel.slug}`}
              className="block px-4 py-3 hover:bg-gray-700 transition-colors"
              onClick={onClose}
            >
              <div className="text-white font-medium">{novel.title}</div>
            </Link>
          ))}
        </div>
      ) : searchQuery.trim() ? (
        <div className="p-4 text-center text-gray-400">
          No results found
        </div>
      ) : null}
    </div>
  )
} 
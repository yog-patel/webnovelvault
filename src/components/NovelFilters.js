'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' }
]

const sortOptions = [
  { value: 'newest', label: 'New' },
  { value: 'popular', label: 'Popular' },
  { value: 'updates', label: 'Updates' },
  { value: 'rating', label: 'Highest Rated' }
]

function dedupeGenres(genres) {
  const seen = new Set()
  return genres.filter(g => {
    const name = g.name.toLowerCase()
    if (seen.has(name)) return false
    seen.add(name)
    return true
  })
}

export default function NovelFilters({ genres }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Multi-select genres
  const currentGenres = (searchParams?.get('genre') || '').split(',').filter(Boolean)
  const currentStatus = searchParams?.get('status') || 'all'
  const currentSort = searchParams?.get('sort') || 'newest'

  const createQueryString = (name, value, multi = false) => {
    const params = new URLSearchParams()
    searchParams?.forEach((v, key) => {
      if (key !== name) {
        params.set(key, v)
      }
    })
    if (multi) {
      params.set(name, value)
    } else if (value !== 'all' || name === 'status') {
      params.set(name, value)
    }
    return params.toString()
  }

  // Deduplicate genres
  const uniqueGenres = dedupeGenres(genres || [])

  // Handler for toggling genres
  const getGenreHref = (genreName) => {
    let selected = [...currentGenres]
    if (selected.includes(genreName)) {
      selected = selected.filter(g => g !== genreName)
    } else {
      selected.push(genreName)
    }
    // Remove empty
    selected = selected.filter(Boolean)
    return `${pathname}?${createQueryString('genre', selected.join(','), true)}`
  }

  // Chip style helpers
  const baseChip =
    'px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-150 flex items-center justify-center min-w-[56px] text-center select-none border-[1.5px]'
  const selectedChip =
    'bg-[var(--color-purple-500)] text-white border-[var(--color-purple-500)]'
  const unselectedChip =
    'bg-[#181828] text-[var(--color-purple-500)] border-[var(--color-purple-500)] hover:bg-[var(--color-purple-500)/10] hover:text-white'

  return (
    <div className="space-y-8">
      {/* Genres */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-300 mb-4">Genre / Category</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`${pathname}?${createQueryString('genre', '', true)}`}
            className={`${baseChip} ${currentGenres.length === 0 ? selectedChip : unselectedChip}`}
          >
            All
          </Link>
          {uniqueGenres.map((g) => {
            const selected = currentGenres.includes(g.name)
            return (
              <Link
                key={g.genre_id}
                href={getGenreHref(g.name)}
                className={`${baseChip} ${selected ? selectedChip : unselectedChip}`}
              >
                {g.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Sort and Status */}
      <div className="flex flex-wrap gap-12 mt-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Order By</h3>
          <div className="flex flex-wrap gap-4">
            {sortOptions.map((option) => (
              <Link
                key={option.value}
                href={`${pathname}?${createQueryString('sort', option.value)}`}
                className={`${baseChip} ${currentSort === option.value ? selectedChip : unselectedChip}`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Status</h3>
          <div className="flex flex-wrap gap-4">
            {statusOptions.map((option) => (
              <Link
                key={option.value}
                href={`${pathname}?${createQueryString('status', option.value)}`}
                className={`${baseChip} ${currentStatus === option.value ? selectedChip : unselectedChip}`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
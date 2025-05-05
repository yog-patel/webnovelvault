'use client'

import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

export default function SectionHeader({ title, link }) {
  if (!title) {
    return null
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {link && (
        <Link
          href={link}
          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors group"
          aria-label={`View all ${title.toLowerCase()}`}
        >
          View All
          <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  )
} 
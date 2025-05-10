'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function NovelCard({ novel, rankingStat }) {
  const [imageError, setImageError] = useState(false)

  if (!novel) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
        <div className="relative h-48 bg-gray-700" />
        <div className="p-4">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3" />
          <div className="flex gap-2 mb-3">
            <div className="h-6 bg-gray-700 rounded w-16" />
            <div className="h-6 bg-gray-700 rounded w-16" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-700 rounded w-16" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/novels/${novel.slug}`} className="group">
      <div className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
        <div className="relative aspect-[3/4]">
          {!imageError ? (
            <Image
              src={novel.cover_image_url || '/placeholder-cover.jpg'}
              alt={novel.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No cover image</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-white font-medium">
                {novel.average_rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
          {rankingStat && (
            <div className="absolute bottom-2 right-2 z-20 bg-black/70 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <span className="font-semibold">{rankingStat.label}:</span>
              <span>{rankingStat.value}</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm h-10 font-medium text-white mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {novel.title}
          </h3>
          {/* <p className="text-xs text-gray-400 mb-2 line-clamp-1">
            {novel.author}
          </p> */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {(novel.total_chapters ?? novel._count?.chapters ?? 0)} Chapters
            </span>
            <span className="text-xs text-gray-400">
              {novel.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
} 
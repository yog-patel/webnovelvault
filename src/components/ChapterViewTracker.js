'use client'
import { useEffect } from 'react'

export default function ChapterViewTracker({ chapterId }) {
  useEffect(() => {
    if (chapterId) {
      fetch(`/api/chapters/${chapterId}/view`, { method: 'POST' })
    }
  }, [chapterId])
  return null
} 
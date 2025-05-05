'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-red-500 text-6xl mb-4">
          <span role="img" aria-label="error">⚠️</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-200">
          Something went wrong
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred. Please try again later.'}
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
          <button
            onClick={() => reset?.()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
} 
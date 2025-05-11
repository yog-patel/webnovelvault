'use client'

import { SessionProvider } from 'next-auth/react'
import { ErrorBoundary } from 'react-error-boundary'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-white mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default function Providers({ children }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SessionProvider>
        {children}
        <SpeedInsights/>
        <Analytics />
      </SessionProvider>
    </ErrorBoundary>
  )
} 
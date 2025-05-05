'use client'

export default function LoadingState({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-t-2 border-purple-400/50 rounded-full animate-spin-slow"></div>
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      {content}
    </div>
  )
} 
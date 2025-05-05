'use client'

import { useState } from 'react'
import NovelInfo from './NovelInfo'
import ChapterList from './ChapterList'

const NovelContent = ({ novel }) => {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors ${
            activeTab === 'info'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors ${
            activeTab === 'chapters'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          Chapters
        </button>
      </div>

      {/* Content */}
      {activeTab === 'info' ? (
        <NovelInfo novel={novel} />
      ) : (
        <ChapterList chapters={novel.chapters} novelSlug={novel.slug} />
      )}
    </div>
  )
}

export default NovelContent 
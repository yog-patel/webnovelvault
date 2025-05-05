import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import ChapterViewTracker from '@/components/ChapterViewTracker'
import SaveLastReadChapter from '@/components/SaveLastReadChapter'
import { getBaseUrl } from '@/lib/utils'

const ChapterCommentsSection = dynamic(() => import('@/components/ChapterCommentsSection'), {
  loading: () => <div className="animate-pulse bg-gray-800 rounded-lg p-6">
    <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
})

async function getChapterAndNovel(slug, chapterId) {
  try {
    // Debug logs
    console.log('Fetching chapter with params:', { slug, chapterId });
    
    // Validate chapterId
    const chapterIdNum = parseInt(chapterId);
    if (isNaN(chapterIdNum)) {
      console.error('Invalid chapter ID:', chapterId);
      return notFound();
    }
    
    // Construct the API URL using getBaseUrl
    const baseUrl = getBaseUrl();
    const apiUrl = `${baseUrl}/api/chapters/${chapterIdNum}`;
    
    console.log('Fetching from URL:', apiUrl);
    
    // Fetch chapter data
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API response error:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      });
      return notFound();
    }
    
    const data = await res.json();
    
    // Debug log for API response
    console.log('API response data:', data);
    
    // Validate response data
    if (!data || !data.chapter || !data.novel) {
      console.error('Invalid API response structure:', data);
      return notFound();
    }
    
    // Validate slug match
    if (data.novel.slug !== slug) {
      console.error('Slug mismatch:', {
        expected: slug,
        received: data.novel.slug,
        novelId: data.novel.novel_id
      });
      return notFound();
    }
    
    return data;
  } catch (error) {
    console.error('Error in getChapterAndNovel:', error);
    throw error;
  }
}

export default async function ChapterPage({ params }) {
  try {
    console.log('ChapterPage params:', params);
    
    const { slug, chapterId } = await params;
    if (!slug || !chapterId) {
      console.error('Missing required params:', { slug, chapterId });
      return notFound();
    }
    
    const data = await getChapterAndNovel(slug, chapterId);
    console.log('ChapterPage data:', data); // <-- Debug log
    if (!data) {
      return <div className="text-red-500">No data received from API.</div>;
    }
    const { chapter, novel } = data;

    if (!chapter) {
      console.error('No chapter data found', { data });
      return <div className="text-red-500">No chapter data found.</div>;
    }
    
    if (!chapter.content) {
      console.error('Chapter content is empty', { chapter });
      return <div className="text-red-500">Chapter content is empty.</div>;
    }

    // Find previous and next chapters
    const currentIndex = novel.chapters.findIndex(ch => ch.chapter_id === chapter.chapter_id);
    const prevChapter = currentIndex > 0 ? novel.chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < novel.chapters.length - 1 ? novel.chapters[currentIndex + 1] : null;

    // Map comments to expected UI structure
    function mapComment(comment) {
      return {
        ...comment,
        user: comment.users,
        replies: (comment.other_chapter_comments || []).map(mapComment),
      };
    }
    const mappedComments = (chapter.comments || []).map(mapComment);

    return (
      <>
        <ChapterViewTracker chapterId={chapter.chapter_id} />
        <SaveLastReadChapter novel={novel} chapter={chapter} />
        <div className="max-w-3xl mx-auto py-8 space-y-8">
          {/* Navigation Controls - Top */}
          <div className="sticky top-0 z-10 bg-gray-900 bg-opacity-95 backdrop-blur-sm py-4 px-4 sm:px-0 shadow-lg">
            <div className="flex justify-between items-center gap-4">
              {prevChapter ? (
                <Link
                  href={`/novels/${novel.slug}/chapters/${prevChapter.chapter_id}`}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 min-w-[40px] justify-center"
                >
                  <span>←</span>
                  <span className="hidden sm:inline">Previous Chapter</span>
                </Link>
              ) : (
                <div className="min-w-[40px]" />
              )}
              <Link
                href={`/novels/${novel.slug}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
              >
                Novel Home
              </Link>
              {nextChapter ? (
                <Link
                  href={`/novels/${novel.slug}/chapters/${nextChapter.chapter_id}`}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 min-w-[40px] justify-center"
                >
                  <span className="hidden sm:inline">Next Chapter</span>
                  <span>→</span>
                </Link>
              ) : (
                <div className="min-w-[40px]" />
              )}
            </div>
          </div>

          {/* Chapter Content */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {chapter.title || `Chapter ${chapter.chapter_number}`}
            </h1>
            <div className="text-gray-400 mb-4">
              <span>From: </span>
              <span className="font-semibold text-purple-400">{novel.title}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-gray-300 leading-relaxed space-y-4">
                {chapter.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls - Bottom */}
          <div className="flex justify-between items-center gap-4 px-4 sm:px-0 border-t border-gray-800 pt-8">
            {prevChapter ? (
              <Link
                href={`/novels/${novel.slug}/chapters/${prevChapter.chapter_id}`}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 min-w-[40px] justify-center"
              >
                <span>←</span>
                <span className="hidden sm:inline">Previous Chapter</span>
              </Link>
            ) : (
              <div className="min-w-[40px]" />
            )}
            <Link
              href={`/novels/${novel.slug}`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
            >
              Novel Home
            </Link>
            {nextChapter ? (
              <Link
                href={`/novels/${novel.slug}/chapters/${nextChapter.chapter_id}`}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 min-w-[40px] justify-center"
              >
                <span className="hidden sm:inline">Next Chapter</span>
                <span>→</span>
              </Link>
            ) : (
              <div className="min-w-[40px]" />
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-xl font-semibold text-white mb-6 px-4 sm:px-0">Comments</h2>
            <Suspense fallback={
              <div className="animate-pulse bg-gray-800 rounded-lg p-6">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            }>
              <ChapterCommentsSection chapterId={chapter.chapter_id} comments={mappedComments} />
            </Suspense>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error in ChapterPage:', error);
    return <div className="text-red-500">An error occurred while loading the chapter. {error?.message}</div>;
  }
} 
import prisma from '@/lib/prisma'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import ChapterViewTracker from '@/components/ChapterViewTracker'
import SaveLastReadChapter from '@/components/SaveLastReadChapter'

const ChapterCommentsSection = dynamic(() => import('@/components/ChapterCommentsSection'), {
  loading: () => <div className="animate-pulse bg-gray-800 rounded-lg p-6">
    <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
})

async function getChapterAndNovelDirect(slug, chapterId) {
  const chapterIdNum = parseInt(chapterId);
  if (isNaN(chapterIdNum)) return null;

  const chapter = await prisma.chapters.findUnique({
    where: { chapter_id: chapterIdNum },
    include: {
      novels: {
        select: {
          novel_id: true,
          title: true,
          slug: true,
          cover_image_url: true,
          description: true,
          chapters: {
            select: {
              chapter_id: true,
              chapter_number: true,
              title: true,
              created_at: true,
              updated_at: true
            },
            orderBy: { chapter_number: 'asc' }
          }
        }
      },
      chapter_comments: {
        where: { parent_comment_id: null },
        include: {
          users: { select: { username: true, display_name: true, avatar_url: true } },
          other_chapter_comments: {
            include: {
              users: { select: { username: true, display_name: true, avatar_url: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (!chapter || !chapter.novels || chapter.novels.slug !== slug) return null;

  return {
    chapter: {
      chapter_id: chapter.chapter_id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      content: chapter.content,
      is_free: chapter.is_free,
      view_count: typeof chapter.view_count === 'object' && chapter.view_count !== null
        ? Number(chapter.view_count)
        : chapter.view_count || 0,
      created_at: chapter.created_at ? new Date(chapter.created_at).toISOString() : null,
      updated_at: chapter.updated_at ? new Date(chapter.updated_at).toISOString() : null,
      comments: chapter.chapter_comments || []
    },
    novel: {
      novel_id: chapter.novels.novel_id,
      title: chapter.novels.title,
      slug: chapter.novels.slug,
      cover_image_url: chapter.novels.cover_image_url,
      description: chapter.novels.description,
      chapters: Array.isArray(chapter.novels.chapters)
        ? chapter.novels.chapters.map(chap => ({
            ...chap,
            created_at: chap.created_at ? new Date(chap.created_at).toISOString() : null,
            updated_at: chap.updated_at ? new Date(chap.updated_at).toISOString() : null,
          }))
        : [],
    }
  };
}

export default async function ChapterPage({ params }) {
  try {
    const { slug, chapterId } = params;
    if (!slug || !chapterId) {
      return notFound();
    }

    const data = await getChapterAndNovelDirect(slug, chapterId);
    if (!data) {
      return <div className="text-red-500">No chapter data found.</div>;
    }
    const { chapter, novel } = data;

    if (!chapter) {
      return <div className="text-red-500">No chapter data found.</div>;
    }
    if (!chapter.content) {
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
    return <div className="text-red-500">An error occurred while loading the chapter. {error?.message}</div>;
  }
} 
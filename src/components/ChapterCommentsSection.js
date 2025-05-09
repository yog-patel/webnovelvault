'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { FaReply } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

// Comment component for rendering individual comments
const Comment = ({ comment, onReply }) => {
  return (
    <div className="pt-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {comment.user?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={comment.user.avatar_url}
                alt={comment.user.display_name || comment.user.username}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {comment.user?.name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{comment.user?.display_name || comment.user?.username || 'Anonymous'}</span>
            <span className="text-sm text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          {onReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 mt-2"
            >
              <FaReply />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-4 space-y-4 border-l-2 border-gray-800">
          {comment.replies.map((reply) => (
            <div key={reply.comment_id} className="pl-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {reply.user?.avatar_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={reply.user.avatar_url}
                        alt={reply.user.display_name || reply.user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {reply.user?.name?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{reply.user?.display_name || reply.user?.username || 'Anonymous'}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChapterCommentsSection({ comments: initialComments = [], chapterId, onCommentAdded }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/chapter-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          chapterId: chapterId,
          parentCommentId: replyTo?.comment_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newComment = await response.json()
      
      // Update comments state
      if (!replyTo) {
        // For new top-level comments
        setComments(prevComments => [{
          ...newComment,
          replies: []
        }, ...prevComments])
      } else {
        // For replies
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.comment_id === replyTo.comment_id
              ? {
                  ...comment,
                  replies: [newComment, ...(comment.replies || [])]
                }
              : comment
          )
        )
      }

      setComment('')
      setReplyTo(null)
      if (onCommentAdded) {
        onCommentAdded(newComment)
      }
      toast.success('Comment posted successfully')
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!chapterId) {
    return <div className="text-gray-400">No chapter ID provided</div>
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6">Comments</h2>

      {/* Comment Form */}
      {session ? (
        <div className="mb-8">
          {replyTo && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Replying to <span className="text-purple-400">{replyTo.user?.display_name || replyTo.user?.username || 'Anonymous'}</span>
                </p>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-500 hover:text-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-200 placeholder-gray-500"
                rows={4}
                autoFocus={replyTo !== null}
                onFocus={(e) => e.target.selectionStart = e.target.selectionEnd = e.target.value.length}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? 'Posting...' : replyTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm text-center">
          <p className="text-gray-300">
            Please{' '}
            <a href="/auth/signin" className="text-purple-400 hover:text-purple-300">
              sign in
            </a>{' '}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.comment_id}
              comment={comment}
              onReply={session ? setReplyTo : null}
            />
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  )
} 
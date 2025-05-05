'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaReply } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function CommentsSection({ novelId, comments: initialComments = [] }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please login to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          novelId,
          content: newComment.trim(),
          parentCommentId: replyingTo
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      const data = await response.json()
      
      // For new top-level comments
      if (!replyingTo) {
        setComments(prevComments => [{
          ...data,
          other_novel_comments: []
        }, ...prevComments])
      } else {
        // For replies
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.comment_id === replyingTo
              ? {
                  ...comment,
                  other_novel_comments: [data, ...(comment.other_novel_comments || [])]
                }
              : comment
          )
        )
      }
      
      setNewComment('')
      setReplyingTo(null)
      toast.success('Comment submitted successfully')
    } catch (error) {
      console.error('Comment submission error:', error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please login to reply')
      return
    }

    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          novelId,
          content: replyContent.trim(),
          parentCommentId: parentId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }

      const data = await response.json()
      
      // Update comments state to include the new reply
      setComments(prevComments => {
        const updateReplies = (comments) => {
          return comments.map(comment => {
            // If this is the parent comment we're replying to
            if (comment.comment_id === parentId) {
              return {
                ...comment,
                other_novel_comments: [data, ...(comment.other_novel_comments || [])]
              }
            }
            // Check if the reply is in other_novel_comments
            if (comment.other_novel_comments?.length > 0) {
              return {
                ...comment,
                other_novel_comments: updateReplies(comment.other_novel_comments)
              }
            }
            return comment
          })
        }
        return updateReplies(prevComments)
      })

      setReplyContent('')
      setReplyingTo(null)
      toast.success('Reply submitted successfully')
    } catch (error) {
      console.error('Reply submission error:', error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const Comment = ({ comment, isReply = false }) => (
    <div className="pt-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-purple-600 flex items-center justify-center`}>
            <span className="text-white font-medium">
              {comment.users?.username?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
        </div>
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{comment.users?.display_name || comment.users?.username || 'Anonymous'}</span>
            <span className="text-sm text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          {session && (
            <button
              onClick={() => setReplyingTo(comment.comment_id)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 mt-2"
            >
              <FaReply />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {comment.other_novel_comments && comment.other_novel_comments.length > 0 && (
        <div className="ml-12 mt-4 space-y-4 border-l-2 border-gray-800">
          {comment.other_novel_comments.map((reply) => (
            <div key={reply.comment_id} className="pl-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {reply.users?.username?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{reply.users?.display_name || reply.users?.username || 'Anonymous'}</span>
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

      {/* Reply Form */}
      {replyingTo === comment.comment_id && (
        <div className="ml-12 mt-4">
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Replying to <span className="text-purple-400">{comment.users?.username || 'Anonymous'}</span>
              </p>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-500 hover:text-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
          <form onSubmit={(e) => handleSubmitReply(e, comment.comment_id)} className="space-y-4">
            <div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-200 placeholder-gray-500"
                rows={4}
                autoFocus={replyingTo !== null}
                onFocus={(e) => e.target.selectionStart = e.target.selectionEnd = e.target.value.length}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !replyContent.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )

  if (!novelId) {
    return <div className="text-gray-400">No novel ID provided</div>
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6">Comments</h2>

      {/* Comment Form */}
      {session ? (
        <div className="mb-8">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-200 placeholder-gray-500"
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Posting...' : 'Post Comment'}
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
            />
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  )
} 
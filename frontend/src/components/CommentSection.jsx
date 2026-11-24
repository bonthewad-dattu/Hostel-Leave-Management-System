import { useState } from 'react'
import { MessageSquare, Send, UserRound } from 'lucide-react'

function CommentSection({
  comments = [],
  onAddComment,
  readOnly = false,
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

  const trimmedMessage = message.trim()
  if (!trimmedMessage) return

  setError('')
  setSubmitting(true)
  try {
    await onAddComment?.(trimmedMessage)
    setMessage('')
  } catch (commentError) {
    setError(commentError.message)
  } finally {
    setSubmitting(false)
  }
}

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

    <div className="flex items-center gap-3">

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
        <MessageSquare size={19} />
      </span>

      <div>
        <h3 className="font-bold text-slate-900">Review comments</h3>
        <p className="text-xs text-slate-500">
          {comments.length} comments
        </p>
      </div>
      
    </div>


    <div className="mt-5 space-y-4">
      {comments.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No comments have been added yet.
        </p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <UserRound size={17} />
            </span>


           <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {comment.author || 'Warden'}
              </p>

              <time className="text-xs text-slate-400">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString()
                  : ''}
              </time>
              
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {comment.message}
            </p>

           </div>

          </div>
        ))
      )}
    </div>

      {!readOnly && (
        <form onSubmit={handleSubmit} className="mt-5 border-t border-slate-100 pt-5">

          <label
            htmlFor="reviewComment"
            className="text-sm font-semibold text-slate-700">
            Add a review comment
          </label>

          <textarea
            id="reviewComment"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Write your feedback or review notes..."
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"/>

          {error && (
            <p role="alert" className="mt-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-3 flex justify-end">
            
            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Send size={15} />
              {submitting ? 'Adding…' : 'Add comment'}
            </button>

          </div>

        </form>

      )}
    </section>
  )
}

export default CommentSection

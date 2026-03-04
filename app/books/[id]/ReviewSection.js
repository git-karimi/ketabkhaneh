'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition"
        >
          {star <= (hover || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ bookId, reviews, user, userReview }) {
  const [rating, setRating] = useState(userReview?.rating || 0)
  const [comment, setComment] = useState(userReview?.comment || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (rating === 0) { setError('لطفاً امتیاز بدهید'); return }
    setLoading(true)
    setError('')

    if (userReview) {
      await supabase.from('reviews')
        .update({ rating, comment })
        .eq('id', userReview.id)
    } else {
      await supabase.from('reviews').insert({
        book_id: bookId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      })
    }

    setShowForm(false)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('نظر شما حذف شود؟')) return
    await supabase.from('reviews').delete().eq('id', userReview.id)
    setRating(0)
    setComment('')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        نظرات ({reviews.length})
      </h2>

      {/* فرم ثبت نظر */}
      {user && (
        <div className="mb-6">
          {!showForm && !userReview && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition text-sm">
              + نظر و امتیاز خود را بنویسید
            </button>
          )}

          {userReview && !showForm && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-700">نظر شما</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s}>{s <= userReview.rating ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                  {userReview.comment && (
                    <p className="text-sm text-gray-600 mt-2">{userReview.comment}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(true)}
                    className="text-xs text-blue-600 hover:underline">ویرایش</button>
                  <button onClick={handleDelete}
                    className="text-xs text-red-500 hover:underline">حذف</button>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {userReview ? 'ویرایش نظر' : 'ثبت نظر جدید'}
              </p>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
              )}

              <StarRating value={rating} onChange={setRating} />

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="نظر خود را بنویسید (اختیاری)..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition">
                  {loading ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  انصراف
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* لیست نظرات */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          هنوز نظری ثبت نشده
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-700">
                  {review.profiles?.full_name || 'کاربر'}
                </p>
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-sm">
                      {s <= review.rating ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(review.created_at).toLocaleDateString('fa-IR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
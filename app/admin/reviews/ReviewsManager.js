'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ReviewsManager({ reviews }) {
  const [loading, setLoading] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle(reviewId, isActive) {
    setLoading(reviewId)
    await supabase.from('reviews')
      .update({ is_active: !isActive })
      .eq('id', reviewId)
    router.refresh()
    setLoading(null)
  }

  async function handleDelete(reviewId) {
    if (!confirm('این نظر حذف شود؟')) return
    setLoading(reviewId)
    await supabase.from('reviews').delete().eq('id', reviewId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">⭐ مدیریت نظرات</h1>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">بازگشت</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">نظری ثبت نشده</div>
          ) : reviews.map(review => (
            <div key={review.id}
              className={`bg-white rounded-xl p-5 shadow-sm ${!review.is_active ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <p className="font-medium text-gray-800">
                      {review.profiles?.full_name || 'کاربر'}
                    </p>
                    <span className="text-xs text-gray-400">درباره:</span>
                    <p className="text-sm text-blue-600">{review.books?.title}</p>
                  </div>
                  <div className="flex mb-2">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-sm">
                        {s <= review.rating ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div className="flex gap-2 mr-4">
                  <button
                    onClick={() => handleToggle(review.id, review.is_active)}
                    disabled={loading === review.id}
                    className={`text-xs px-3 py-1 rounded-lg transition disabled:opacity-50 ${
                      review.is_active
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                    {loading === review.id ? '...' : review.is_active ? 'غیرفعال' : 'فعال'}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={loading === review.id}
                    className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50">
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
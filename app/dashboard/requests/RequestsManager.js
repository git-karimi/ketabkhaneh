'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RequestsManager({ received, sent }) {
  const [tab, setTab] = useState('received')
  const [loading, setLoading] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleStatus(requestId, status) {
    setLoading(requestId)
    await supabase.from('requests').update({ status }).eq('id', requestId)
    router.refresh()
    setLoading(null)
  }

  const statusLabel = s =>
    s === 'pending' ? '⏳ در انتظار' :
    s === 'accepted' ? '✅ پذیرفته' : '❌ رد شده'

  const typeLabel = t =>
    t === 'borrow' ? 'قرض' : t === 'gift' ? 'هدیه' : 'خرید'

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📬 درخواست‌ها</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">بازگشت</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* تب‌ها */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('received')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'received' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
            دریافتی ({received.length})
          </button>
          <button onClick={() => setTab('sent')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'sent' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
            ارسالی ({sent.length})
          </button>
        </div>

        {/* لیست درخواست‌های دریافتی */}
        {tab === 'received' && (
          <div className="space-y-4">
            {received.length === 0 ? (
              <div className="text-center py-12 text-gray-400">درخواستی دریافت نشده</div>
            ) : received.map(req => (
              <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{req.books?.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      از: {req.profiles?.full_name || 'کاربر'} —
                      نوع: {typeLabel(req.request_type)}
                    </p>
                    {req.message && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {req.message}
                      </p>
                    )}
                  </div>
                  <span className="text-xs">{statusLabel(req.status)}</span>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleStatus(req.id, 'accepted')}
                      disabled={loading === req.id}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition">
                      ✅ قبول
                    </button>
                    <button
                      onClick={() => handleStatus(req.id, 'rejected')}
                      disabled={loading === req.id}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition">
                      ❌ رد
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* لیست درخواست‌های ارسالی */}
        {tab === 'sent' && (
          <div className="space-y-4">
            {sent.length === 0 ? (
              <div className="text-center py-12 text-gray-400">درخواستی ارسال نشده</div>
            ) : sent.map(req => (
              <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm">
                <p className="font-medium text-gray-800">{req.books?.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  به: {req.profiles?.full_name || 'کاربر'} —
                  نوع: {typeLabel(req.request_type)}
                </p>
                {req.message && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{req.message}</p>
                )}
                <p className="text-xs mt-3">{statusLabel(req.status)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
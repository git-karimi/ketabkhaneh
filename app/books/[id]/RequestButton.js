'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RequestButton({ bookId, ownerId, offerTypes, userId }) {
  const [selectedType, setSelectedType] = useState(offerTypes?.[0] || '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleRequest() {
    if (!selectedType) { setError('نوع درخواست را انتخاب کنید'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.from('requests').insert({
      book_id: bookId,
      requester_id: userId,
      owner_id: ownerId,
      request_type: selectedType,
      message: message.trim() || null,
    })

    if (error) {
      setError('خطا در ارسال درخواست')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="p-4 bg-blue-50 rounded-xl space-y-3">
      <h3 className="font-medium text-gray-700">ارسال درخواست</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</div>
      )}

      {/* انتخاب نوع درخواست */}
      {offerTypes?.length > 1 && (
        <div className="flex gap-2">
          {offerTypes.map(type => (
            <button key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-2 rounded-lg text-sm border transition ${
                selectedType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}>
              {type === 'borrow' ? '📤 قرض' : type === 'gift' ? '🎁 هدیه' : '💰 خرید'}
            </button>
          ))}
        </div>
      )}

      {/* پیام */}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={3}
        placeholder="پیام برای صاحب کتاب (اختیاری)..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? 'در حال ارسال...' : 'ارسال درخواست'}
      </button>
    </div>
  )
}
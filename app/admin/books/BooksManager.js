'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BooksManager({ books }) {
  const [loading, setLoading] = useState(null)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggle(bookId, isActive) {
    setLoading(bookId)
    await supabase.from('books')
      .update({ is_active: !isActive })
      .eq('id', bookId)
    router.refresh()
    setLoading(null)
  }

  async function handleDelete(bookId) {
    if (!confirm('آیا مطمئنید؟ این عمل قابل بازگشت نیست.')) return
    setLoading(bookId)
    await supabase.from('books').delete().eq('id', bookId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">📚 مدیریت کتاب‌ها</h1>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">بازگشت</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس عنوان یا نویسنده..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-gray-600">کتاب</th>
                <th className="text-right px-4 py-3 text-gray-600">صاحب</th>
                <th className="text-right px-4 py-3 text-gray-600">نوع</th>
                <th className="text-right px-4 py-3 text-gray-600">وضعیت</th>
                <th className="text-right px-4 py-3 text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(book => (
                <tr key={book.id} className={!book.is_active ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{book.title}</p>
                    <p className="text-xs text-gray-400">{book.author}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {book.profiles?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {book.offer_type?.map(type => (
                        <span key={type} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {type === 'borrow' ? 'قرض' : type === 'gift' ? 'هدیه' : 'فروش'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {book.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(book.id, book.is_active)}
                        disabled={loading === book.id}
                        className={`text-xs px-3 py-1 rounded-lg transition disabled:opacity-50 ${
                          book.is_active
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                        {loading === book.id ? '...' : book.is_active ? 'غیرفعال' : 'فعال'}
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        disabled={loading === book.id}
                        className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
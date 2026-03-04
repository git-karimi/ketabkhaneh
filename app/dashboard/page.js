'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setBooks(books || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleDelete(bookId) {
    if (!confirm('آیا مطمئنید؟')) return
    await supabase.from('books').delete().eq('id', bookId)
    setBooks(books.filter(b => b.id !== bookId))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">در حال بارگذاری...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* هدر */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📚 کتابخانه من</h1>
          <div className="flex gap-3 items-center">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* دکمه افزودن */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            کتاب‌های من ({books.length})
          </h2>
          <Link
            href="/books/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + افزودن کتاب
          </Link>
        </div>
	<Link
  href="/dashboard/requests"
  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
>
  📬 درخواست‌ها
</Link>

        {/* لیست کتاب‌ها */}
        {books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📖</div>
            <p>هنوز کتابی اضافه نکردید</p>
            <Link href="/books/add" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
              اولین کتاب را اضافه کنید
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{book.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                  <div className="flex gap-2 mt-2">
                    {book.offer_type?.map(type => (
                      <span key={type} className={`text-xs px-2 py-1 rounded-full ${
                        type === 'borrow' ? 'bg-blue-100 text-blue-700' :
                        type === 'gift' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {type === 'borrow' ? 'قرض' : type === 'gift' ? 'هدیه' : 'فروش'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/books/edit/${book.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ویرایش
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
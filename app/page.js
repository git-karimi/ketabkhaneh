'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [books, setBooks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [offerFilter, setOfferFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('books')
        .select(`*, profiles(full_name, city)`)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      setBooks(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let result = books

    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(b =>
        b.title?.toLowerCase().includes(s) ||
        b.author?.toLowerCase().includes(s) ||
        b.translator?.toLowerCase().includes(s) ||
        b.isbn?.includes(s)
      )
    }

    if (offerFilter !== 'all') {
      result = result.filter(b => b.offer_type?.includes(offerFilter))
    }

    if (langFilter !== 'all') {
      result = result.filter(b => b.language === langFilter)
    }

    setFiltered(result)
  }, [search, offerFilter, langFilter, books])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* هدر */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📚 کتابخانه</h1>
          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <Link href="/dashboard"
                  className="text-sm text-blue-600 hover:underline">
                  داشبورد
                </Link>
                <button onClick={handleLogout}
                  className="text-sm text-red-500 hover:underline">
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  ورود
                </Link>
                <Link href="/register"
                  className="text-sm text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* عنوان */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">کتاب‌های موجود</h2>
          <p className="text-gray-500 text-sm">کتاب‌هایی که کاربران برای قرض، هدیه یا فروش گذاشتند</p>
        </div>

        {/* جستجو و فیلتر */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 space-y-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو بر اساس عنوان، نویسنده، مترجم یا شابک..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          <div className="flex gap-2 flex-wrap">
            {/* فیلتر نوع پیشنهاد */}
            {[
              { value: 'all', label: 'همه' },
              { value: 'borrow', label: '📤 قرض' },
              { value: 'gift', label: '🎁 هدیه' },
              { value: 'sell', label: '💰 فروش' },
            ].map(f => (
              <button key={f.value}
                onClick={() => setOfferFilter(f.value)}
                className={`text-sm px-3 py-1 rounded-full border transition ${
                  offerFilter === f.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}>
                {f.label}
              </button>
            ))}

            <div className="border-r border-gray-200 mx-1" />

            {/* فیلتر زبان */}
            {[
              { value: 'all', label: 'همه زبان‌ها' },
              { value: 'fa', label: 'فارسی' },
              { value: 'en', label: 'انگلیسی' },
            ].map(f => (
              <button key={f.value}
                onClick={() => setLangFilter(f.value)}
                className={`text-sm px-3 py-1 rounded-full border transition ${
                  langFilter === f.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            {filtered.length} کتاب یافت شد
          </p>
        </div>

        {/* لیست کتاب‌ها */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">در حال بارگذاری...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p>کتابی با این مشخصات پیدا نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(book => (
              <div key={book.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{book.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                  {book.translator && (
                    <p className="text-xs text-gray-400 mt-1">ترجمه: {book.translator}</p>
                  )}
                  {book.genre && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mt-2">
                      {book.genre}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex gap-1 flex-wrap mb-3">
                    {book.offer_type?.map(type => (
                      <span key={type} className={`text-xs px-2 py-1 rounded-full font-medium ${
                        type === 'borrow' ? 'bg-blue-100 text-blue-700' :
                        type === 'gift' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {type === 'borrow' ? '📤 قرض' : type === 'gift' ? '🎁 هدیه' : '💰 فروش'}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>
                      {book.condition === 'new' ? '✨ نو' :
                       book.condition === 'good' ? '👍 خوب' :
                       book.condition === 'fair' ? '👌 متوسط' : '📄 فرسوده'}
                    </span>
                    {book.profiles?.city && <span>📍 {book.profiles.city}</span>}
                  </div>

                  {book.price && (
                    <p className="text-sm font-medium text-orange-600 mt-2">
                      {book.price.toLocaleString()} تومان
                    </p>
                  )}

                  <Link href={`/books/${book.id}`}
                    className="block mt-3 text-center text-sm bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition">
                    مشاهده جزئیات
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
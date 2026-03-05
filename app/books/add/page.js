'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AddBook() {
  const [form, setForm] = useState({
    title: '', author: '', translator: '', publisher: '',
    isbn: '', year: '', language: 'fa', genre: '',
    condition: 'good', offer_type: [], price: '', description: ''
  })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isbnLoading, setIsbnLoading] = useState(false)
  const [isbnError, setIsbnError] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleOfferType(type) {
    setForm(prev => ({
      ...prev,
      offer_type: prev.offer_type.includes(type)
        ? prev.offer_type.filter(t => t !== type)
        : [...prev.offer_type, type]
    }))
  }

  function handleCoverChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم تصویر نباید بیشتر از ۲ مگابایت باشد')
      return
    }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function fetchBookByISBN() {
    if (!form.isbn.trim()) { setIsbnError('شابک را وارد کنید'); return }
    setIsbnLoading(true)
    setIsbnError('')

    const isbn = form.isbn.replace(/-/g, '').trim()

    try {
      const googleRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      )
      const googleData = await googleRes.json()

      if (googleData.items?.length > 0) {
        const info = googleData.items[0].volumeInfo
        setForm(prev => ({
          ...prev,
          title: info.title || prev.title,
          author: info.authors?.join('، ') || prev.author,
          publisher: info.publisher || prev.publisher,
          year: info.publishedDate?.substring(0, 4) || prev.year,
          description: info.description?.substring(0, 300) || prev.description,
          language: info.language === 'fa' ? 'fa' :
                    info.language === 'en' ? 'en' : prev.language,
        }))

        // اگر تصویر جلد از Google Books داشت
        const thumbnail = info.imageLinks?.thumbnail
        if (thumbnail && !coverPreview) {
          setCoverPreview(thumbnail.replace('http:', 'https:'))
        }

        setIsbnLoading(false)
        return
      }

      const olRes = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      )
      const olData = await olRes.json()
      const book = olData[`ISBN:${isbn}`]

      if (book) {
        setForm(prev => ({
          ...prev,
          title: book.title || prev.title,
          author: book.authors?.map(a => a.name).join('، ') || prev.author,
          publisher: book.publishers?.[0]?.name || prev.publisher,
          year: book.publish_date?.match(/\d{4}/)?.[0] || prev.year,
        }))
        if (book.cover?.large && !coverPreview) {
          setCoverPreview(book.cover.large)
        }
      } else {
        setIsbnError('کتابی با این شابک پیدا نشد — اطلاعات را دستی وارد کنید')
      }
    } catch {
      setIsbnError('خطا در اتصال به سرویس کتاب‌شناسی')
    }

    setIsbnLoading(false)
  }

  async function uploadCover(userId) {
  if (!coverFile) return null

  const ext = coverFile.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(fileName, coverFile)

  if (error) {
    console.error('upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('book-covers')
    .getPublicUrl(fileName)

  console.log('cover url:', urlData.publicUrl)
  return urlData.publicUrl
}

  async function handleSubmit() {
    if (!form.title || !form.author) {
      setError('عنوان و نویسنده الزامی است')
      return
    }
    if (form.offer_type.length === 0) {
      setError('حداقل یک نوع پیشنهاد انتخاب کنید')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    // آپلود تصویر
    let coverUrl = null
    if (coverFile) {
       coverUrl = await uploadCover(user.id)
       console.log('coverUrl before save:', coverUrl)
    } else if (coverPreview && coverPreview.startsWith('http')) {
      coverUrl = coverPreview
      console.log('coverUrl from API:', coverUrl)
    }

    const { error } = await supabase.from('books').insert({
      ...form,
      user_id: user.id,
      year: form.year ? parseInt(form.year) : null,
      price: form.price ? parseInt(form.price) : null,
      cover_url: coverUrl,
    })

    if (error) {
      setError('خطا در ذخیره کتاب: ' + error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">افزودن کتاب جدید</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <div className="space-y-4">

            {/* جستجو با شابک */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                🔍 پر کردن خودکار با شابک (ISBN)
              </p>
              <div className="flex gap-2">
                <input name="isbn" value={form.isbn} onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="مثال: 9786001218552" dir="ltr" />
                <button onClick={fetchBookByISBN} disabled={isbnLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap">
                  {isbnLoading ? '...' : 'جستجو'}
                </button>
              </div>
              {isbnError && <p className="text-xs text-red-500 mt-2">{isbnError}</p>}
            </div>

            {/* آپلود تصویر جلد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تصویر جلد</label>
              <div className="flex gap-4 items-start">
                {/* پیش‌نمایش */}
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                  {coverPreview ? (
                    <img src={coverPreview} alt="جلد کتاب"
                      className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📖</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition">
                      <p className="text-sm text-gray-500">کلیک کنید یا فایل را اینجا بکشید</p>
                      <p className="text-xs text-gray-400 mt-1">JPG، PNG — حداکثر ۲ مگابایت</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                  {coverPreview && (
                    <button
                      onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                      className="text-xs text-red-500 hover:underline">
                      حذف تصویر
                    </button>
                  )}
                  {!coverFile && !coverPreview && (
                    <p className="text-xs text-gray-400">
                      اگر شابک وارد کنید، تصویر خودکار پیدا می‌شود
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنوان کتاب <span className="text-red-500">*</span>
              </label>
              <input name="title" value={form.title} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: بوف کور" />
            </div>

            {/* نویسنده */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نویسنده <span className="text-red-500">*</span>
              </label>
              <input name="author" value={form.author} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: صادق هدایت" />
            </div>

            {/* مترجم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مترجم</label>
              <input name="translator" value={form.translator} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اگر ترجمه است" />
            </div>

            {/* ناشر و سال */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ناشر</label>
                <input name="publisher" value={form.publisher} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سال چاپ</label>
                <input name="year" value={form.year} onChange={handleChange} type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 1402" />
              </div>
            </div>

            {/* ژانر و زبان */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ژانر</label>
                <input name="genre" value={form.genre} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: رمان، علمی" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">زبان</label>
                <select name="language" value={form.language} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="fa">فارسی</option>
                  <option value="en">انگلیسی</option>
                  <option value="ar">عربی</option>
                  <option value="other">سایر</option>
                </select>
              </div>
            </div>

            {/* وضعیت کتاب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت کتاب</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'new', label: 'نو' },
                  { value: 'good', label: 'خوب' },
                  { value: 'fair', label: 'متوسط' },
                  { value: 'poor', label: 'فرسوده' },
                ].map(c => (
                  <button key={c.value} type="button"
                    onClick={() => setForm({ ...form, condition: c.value })}
                    className={`py-2 rounded-lg text-sm border transition ${
                      form.condition === c.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* نوع پیشنهاد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع پیشنهاد <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'borrow', label: '📤 قرض' },
                  { value: 'gift', label: '🎁 هدیه' },
                  { value: 'sell', label: '💰 فروش' },
                ].map(o => (
                  <button key={o.value} type="button"
                    onClick={() => handleOfferType(o.value)}
                    className={`py-2 rounded-lg text-sm border transition ${
                      form.offer_type.includes(o.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* قیمت */}
            {form.offer_type.includes('sell') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان)</label>
                <input name="price" value={form.price} onChange={handleChange} type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 50000" />
              </div>
            )}

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="هر توضیح اضافه‌ای درباره کتاب..." />
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? 'در حال ذخیره...' : 'ذخیره کتاب'}
              </button>
              <button onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditBook({ params }) {
  const [form, setForm] = useState({
    title: '', author: '', translator: '', publisher: '',
    isbn: '', year: '', language: 'fa', genre: '',
    condition: 'good', offer_type: [], price: '', description: ''
  })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadBook() {
      const { id } = await params
      const { data: book } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

      if (!book) { router.push('/dashboard'); return }

      setForm({
        title: book.title || '',
        author: book.author || '',
        translator: book.translator || '',
        publisher: book.publisher || '',
        isbn: book.isbn || '',
        year: book.year || '',
        language: book.language || 'fa',
        genre: book.genre || '',
        condition: book.condition || 'good',
        offer_type: book.offer_type || [],
        price: book.price || '',
        description: book.description || '',
      })
      if (book.cover_url) setCoverPreview(book.cover_url)
      setLoading(false)
    }
    loadBook()
  }, [])

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

  async function uploadCover(userId) {
    if (!coverFile) return null
    const ext = coverFile.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('book-covers')
      .upload(fileName, coverFile)
    if (error) return null
    const { data } = supabase.storage
      .from('book-covers')
      .getPublicUrl(fileName)
    return data.publicUrl
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

    setSaving(true)
    setError('')

    const { id } = await params
    const { data: { user } } = await supabase.auth.getUser()

    let coverUrl = coverPreview
    if (coverFile) {
      const uploaded = await uploadCover(user.id)
      if (uploaded) coverUrl = uploaded
    }

    const { error } = await supabase
      .from('books')
      .update({
        ...form,
        year: form.year ? parseInt(form.year) : null,
        price: form.price ? parseInt(form.price) : null,
        cover_url: coverUrl,
      })
      .eq('id', id)

    if (error) {
      setError('خطا در ذخیره تغییرات')
    } else {
      router.push('/dashboard')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">در حال بارگذاری...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">ویرایش کتاب</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <div className="space-y-4">

            {/* تصویر جلد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تصویر جلد</label>
              <div className="flex gap-4 items-start">
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
                    <button onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                      className="text-xs text-red-500 hover:underline">
                      حذف تصویر
                    </button>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* نویسنده */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نویسنده <span className="text-red-500">*</span>
              </label>
              <input name="author" value={form.author} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* مترجم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مترجم</label>
              <input name="translator" value={form.translator} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* شابک */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شابک (ISBN)</label>
              <input name="isbn" value={form.isbn} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr" />
            </div>

            {/* ژانر و زبان */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ژانر</label>
                <input name="genre" value={form.genre} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
              <button onClick={() => router.push('/dashboard')}
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
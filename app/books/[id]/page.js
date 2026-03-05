import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RequestButton from './RequestButton'
import ReviewSection from './ReviewSection'

export default async function BookDetail({ params }) {
  const supabase = await createServerSupabaseClient()
  const { id } = await params

  const { data: book } = await supabase
    .from('books')
    .select(`*, profiles(id, full_name, city, username)`)
    .eq('id', id)
    .single()

  if (!book) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // درخواست قبلی
  let existingRequest = null
  if (user) {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .eq('book_id', id)
      .eq('requester_id', user.id)
      .single()
    existingRequest = data
  }

  // نظرات
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, profiles(full_name)`)
    .eq('book_id', id)
    .order('created_at', { ascending: false })

  // نظر کاربر فعلی
  const userReview = reviews?.find(r => r.user_id === user?.id) || null

  // میانگین امتیاز
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const isOwner = user?.id === book.profiles?.id

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">→ بازگشت به لیست</Link>
          {user ? (
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">داشبورد</Link>
          ) : (
            <Link href="/login" className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">ورود</Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
	{book.cover_url && (
	  <img
    src={book.cover_url}
    alt={book.title}
    className="w-full h-64 object-contain rounded-xl mb-6 bg-gray-50"
	  />
	)}
          {/* عنوان */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
              <p className="text-lg text-gray-500 mt-1">{book.author}</p>
              {book.translator && (
                <p className="text-sm text-gray-400 mt-1">ترجمه: {book.translator}</p>
              )}
            </div>
            {avgRating && (
              <div className="text-center bg-yellow-50 px-4 py-2 rounded-xl">
                <div className="text-2xl font-bold text-yellow-500">⭐ {avgRating}</div>
                <div className="text-xs text-gray-400">{reviews.length} نظر</div>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {book.offer_type?.map(type => (
              <span key={type} className={`px-3 py-1 rounded-full text-sm font-medium ${
                type === 'borrow' ? 'bg-blue-100 text-blue-700' :
                type === 'gift' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {type === 'borrow' ? '📤 قرض' : type === 'gift' ? '🎁 هدیه' : '💰 فروش'}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-xl text-sm">
            {book.publisher && <div><span className="text-gray-400">ناشر: </span>{book.publisher}</div>}
            {book.year && <div><span className="text-gray-400">سال چاپ: </span>{book.year}</div>}
            {book.isbn && <div><span className="text-gray-400">شابک: </span>{book.isbn}</div>}
            {book.genre && <div><span className="text-gray-400">ژانر: </span>{book.genre}</div>}
            <div><span className="text-gray-400">وضعیت: </span>
              {book.condition === 'new' ? 'نو' :
               book.condition === 'good' ? 'خوب' :
               book.condition === 'fair' ? 'متوسط' : 'فرسوده'}
            </div>
            <div><span className="text-gray-400">زبان: </span>
              {book.language === 'fa' ? 'فارسی' :
               book.language === 'en' ? 'انگلیسی' : book.language}
            </div>
          </div>

          {book.price && (
            <p className="text-xl font-bold text-orange-600 mt-4">
              قیمت: {book.price.toLocaleString()} تومان
            </p>
          )}

          {book.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">{book.description}</p>
          )}

          <div className="mt-6 p-4 border border-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">
              ثبت‌شده توسط: <span className="font-medium text-gray-700">
                {book.profiles?.full_name || 'کاربر'}
              </span>
              {book.profiles?.city && ` — 📍 ${book.profiles.city}`}
            </p>
          </div>

          {/* بخش درخواست */}
          <div className="mt-6">
            {!user ? (
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-3">برای ارسال درخواست باید وارد شوید</p>
                <Link href="/login"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                  ورود و ارسال درخواست
                </Link>
              </div>
            ) : isOwner ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
                این کتاب متعلق به شماست
              </div>
            ) : existingRequest ? (
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-green-700 font-medium">✅ درخواست شما ارسال شده</p>
                <p className="text-sm text-gray-500 mt-1">
                  وضعیت: {existingRequest.status === 'pending' ? 'در انتظار پاسخ' :
                           existingRequest.status === 'accepted' ? 'پذیرفته شده' : 'رد شده'}
                </p>
              </div>
            ) : (
              <RequestButton
                bookId={book.id}
                ownerId={book.profiles?.id}
                offerTypes={book.offer_type}
                userId={user.id}
              />
            )}
          </div>
        </div>

        {/* بخش نظرات */}
        <ReviewSection
          bookId={book.id}
          reviews={reviews || []}
          user={user}
          userReview={userReview}
        />
      </main>
    </div>
  )
}
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // چک کردن نقش ادمین
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // آمار کلی
  const [
    { count: usersCount },
    { count: booksCount },
    { count: requestsCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'کاربران', count: usersCount, icon: '👥', href: '/admin/users' },
    { label: 'کتاب‌ها', count: booksCount, icon: '📚', href: '/admin/books' },
    { label: 'درخواست‌ها', count: requestsCount, icon: '📬', href: '/admin/requests' },
    { label: 'نظرات', count: reviewsCount, icon: '⭐', href: '/admin/reviews' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🛡️ پنل مدیریت</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">بازگشت به سایت</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">داشبورد</h2>

        {/* آمار */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <Link key={s.href} href={s.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-center">
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{s.count}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* منوی مدیریت */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: '/admin/users', icon: '👥', title: 'مدیریت کاربران', desc: 'مشاهده، مسدود کردن و تغییر نقش کاربران' },
            { href: '/admin/books', icon: '📚', title: 'مدیریت کتاب‌ها', desc: 'مشاهده و غیرفعال کردن کتاب‌های نامناسب' },
            { href: '/admin/reviews', icon: '⭐', title: 'مدیریت نظرات', desc: 'حذف نظرات نامناسب' },
            { href: '/admin/requests', icon: '📬', title: 'مدیریت درخواست‌ها', desc: 'مشاهده وضعیت همه درخواست‌ها' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-start gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
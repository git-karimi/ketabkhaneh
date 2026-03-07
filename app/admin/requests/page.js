import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminRequests() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: requests } = await supabase
    .from('requests')
    .select(`
      *,
      books(title),
      requester:profiles!requests_requester_id_fkey(full_name),
      owner:profiles!requests_owner_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  const statusLabel = s =>
    s === 'pending' ? '⏳ در انتظار' :
    s === 'accepted' ? '✅ پذیرفته' : '❌ رد شده'

  const typeLabel = t =>
    t === 'borrow' ? 'قرض' : t === 'gift' ? 'هدیه' : 'خرید'

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">📬 مدیریت درخواست‌ها</h1>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">بازگشت</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-gray-600">کتاب</th>
                <th className="text-right px-4 py-3 text-gray-600">درخواست‌دهنده</th>
                <th className="text-right px-4 py-3 text-gray-600">صاحب کتاب</th>
                <th className="text-right px-4 py-3 text-gray-600">نوع</th>
                <th className="text-right px-4 py-3 text-gray-600">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests?.map(req => (
                <tr key={req.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {req.books?.title || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {req.requester?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {req.owner?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {typeLabel(req.request_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{statusLabel(req.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
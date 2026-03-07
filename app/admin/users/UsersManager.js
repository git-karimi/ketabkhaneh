'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UsersManager({ users, currentUserId }) {
  const [loading, setLoading] = useState(null)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleBan(userId, isBanned) {
    setLoading(userId)
    await supabase.from('profiles')
      .update({ is_banned: !isBanned })
      .eq('id', userId)
    router.refresh()
    setLoading(null)
  }

  async function handleRole(userId, role) {
    setLoading(userId)
    await supabase.from('profiles')
      .update({ role })
      .eq('id', userId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">👥 مدیریت کاربران</h1>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">بازگشت</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-gray-600">کاربر</th>
                <th className="text-right px-4 py-3 text-gray-600">شهر</th>
                <th className="text-right px-4 py-3 text-gray-600">نقش</th>
                <th className="text-right px-4 py-3 text-gray-600">وضعیت</th>
                <th className="text-right px-4 py-3 text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className={u.is_banned ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{u.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">{u.username || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.city || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role || 'user'}
                      disabled={u.id === currentUserId || loading === u.id}
                      onChange={e => handleRole(u.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none">
                      <option value="user">کاربر</option>
                      <option value="moderator">ناظر</option>
                      <option value="admin">ادمین</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      u.is_banned
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {u.is_banned ? 'مسدود' : 'فعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => handleBan(u.id, u.is_banned)}
                        disabled={loading === u.id}
                        className={`text-xs px-3 py-1 rounded-lg transition disabled:opacity-50 ${
                          u.is_banned
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}>
                        {loading === u.id ? '...' : u.is_banned ? 'رفع مسدودیت' : 'مسدود کردن'}
                      </button>
                    )}
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
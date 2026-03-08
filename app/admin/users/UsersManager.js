'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminLayout from '../AdminLayout'

export default function UsersManager({ users, currentUserId, adminName }) {
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
    await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId)
    router.refresh()
    setLoading(null)
  }

  async function handleRole(userId, role) {
    setLoading(userId)
    await supabase.from('profiles').update({ role }).eq('id', userId)
    router.refresh()
    setLoading(null)
  }

  return (
    <AdminLayout adminName={adminName}>
      <div>
        <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem'}}>مدیریت کاربران</h2>

        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام..."
          style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 16px', marginBottom:'1.5rem', fontSize:'0.875rem', outline:'none', background:'#fff'}} />

        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.875rem'}}>
            <thead>
              <tr style={{background:'#f8fafc', borderBottom:'1px solid #e2e8f0'}}>
                {['کاربر','شهر','نقش','وضعیت','عملیات'].map(h => (
                  <th key={h} style={{textAlign:'right', padding:'12px 16px', color:'#475569', fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9', background: u.is_banned ? '#fef2f2' : '#fff'}}>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{fontWeight:600, color:'#0f172a'}}>{u.full_name || '—'}</div>
                    <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>{u.username || '—'}</div>
                  </td>
                  <td style={{padding:'12px 16px', color:'#475569'}}>{u.city || '—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <select value={u.role || 'user'}
                      disabled={u.id === currentUserId || loading === u.id}
                      onChange={e => handleRole(u.id, e.target.value)}
                      style={{border:'1px solid #e2e8f0', borderRadius:6, padding:'4px 8px', fontSize:'0.8rem', background:'#fff'}}>
                      <option value="user">کاربر</option>
                      <option value="moderator">ناظر</option>
                      <option value="admin">ادمین</option>
                    </select>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{fontSize:'0.75rem', padding:'4px 10px', borderRadius:20, background: u.is_banned ? '#fef2f2' : '#ecfdf5', color: u.is_banned ? '#ef4444' : '#10b981', fontWeight:500}}>
                      {u.is_banned ? 'مسدود' : 'فعال'}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    {u.id !== currentUserId && (
                      <button onClick={() => handleBan(u.id, u.is_banned)}
                        disabled={loading === u.id}
                        style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background: u.is_banned ? '#ecfdf5' : '#fef2f2', color: u.is_banned ? '#10b981' : '#ef4444', fontWeight:500}}>
                        {loading === u.id ? '...' : u.is_banned ? 'رفع مسدودیت' : 'مسدود کردن'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
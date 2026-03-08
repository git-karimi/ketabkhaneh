'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminLayout from '../AdminLayout'

export default function RequestsManager({ requests, adminName }) {
  const [loading, setLoading] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  const filtered = requests.filter(r => {
    const matchSearch =
      r.books?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.requester?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.owner?.full_name?.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || r.status === statusFilter

    return matchSearch && matchStatus
  })

  async function handleDelete(requestId) {
    if (!confirm('این درخواست حذف شود؟')) return
    setLoading(requestId)
    await supabase.from('requests').delete().eq('id', requestId)
    router.refresh()
    setLoading(null)
  }

  async function handleStatus(requestId, status) {
    setLoading(requestId)
    await supabase.from('requests').update({ status }).eq('id', requestId)
    router.refresh()
    setLoading(null)
  }

  const statusLabel = s =>
    s === 'pending' ? '⏳ در انتظار' :
    s === 'accepted' ? '✅ پذیرفته' : '❌ رد شده'

  const statusColor = s =>
    s === 'pending' ? { bg: '#fffbeb', color: '#f59e0b' } :
    s === 'accepted' ? { bg: '#ecfdf5', color: '#10b981' } :
    { bg: '#fef2f2', color: '#ef4444' }

  const typeLabel = t =>
    t === 'borrow' ? '📤 قرض' : t === 'gift' ? '🎁 هدیه' : '💰 خرید'

  return (
    <AdminLayout adminName={adminName}>
      <div>
        <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem'}}>
          مدیریت درخواست‌ها
          <span style={{fontSize:'0.9rem', fontWeight:400, color:'#94a3b8', marginRight:8}}>
            ({filtered.length} درخواست)
          </span>
        </h2>

        {/* جستجو و فیلتر */}
        <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو بر اساس کتاب یا کاربر..."
            style={{flex:1, minWidth:200, border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 16px', fontSize:'0.875rem', outline:'none', background:'#fff'}} />

          <div style={{display:'flex', gap:6}}>
            {[
              { value: 'all', label: 'همه' },
              { value: 'pending', label: '⏳ در انتظار' },
              { value: 'accepted', label: '✅ پذیرفته' },
              { value: 'rejected', label: '❌ رد شده' },
            ].map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                style={{fontSize:'0.8rem', padding:'8px 14px', borderRadius:8, border:'none', cursor:'pointer', background: statusFilter === f.value ? '#6366f1' : '#f1f5f9', color: statusFilter === f.value ? '#fff' : '#475569', fontWeight: statusFilter === f.value ? 600 : 400, transition:'all 0.15s'}}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* لیست درخواست‌ها */}
        {filtered.length === 0 ? (
          <div style={{textAlign:'center', padding:'3rem', color:'#94a3b8', background:'#fff', borderRadius:12}}>
            درخواستی یافت نشد
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
            {filtered.map(req => (
              <div key={req.id}
                style={{background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:'1rem'}}>
                  
                  {/* اطلاعات */}
                  <div style={{flex:1}}>
                    <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:8}}>
                      <span style={{fontWeight:700, color:'#0f172a'}}>{req.books?.title || '—'}</span>
                      <span style={{fontSize:'0.75rem', color:'#94a3b8'}}>{req.books?.author}</span>
                      <span style={{fontSize:'0.75rem', padding:'3px 8px', borderRadius:20, background:'#f1f5f9', color:'#475569'}}>
                        {typeLabel(req.request_type)}
                      </span>
                    </div>

                    <div style={{display:'flex', gap:'1.5rem', fontSize:'0.8rem', color:'#475569', marginBottom:8}}>
                      <span>👤 درخواست‌دهنده: <strong>{req.requester?.full_name || '—'}</strong></span>
                      <span>📖 صاحب کتاب: <strong>{req.owner?.full_name || '—'}</strong></span>
                    </div>

                    {req.message && (
                      <div style={{fontSize:'0.8rem', color:'#475569', background:'#f8fafc', padding:'8px 12px', borderRadius:8, marginBottom:8}}>
                        💬 {req.message}
                      </div>
                    )}

                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <span style={{fontSize:'0.75rem', padding:'4px 10px', borderRadius:20, background: statusColor(req.status).bg, color: statusColor(req.status).color, fontWeight:500}}>
                        {statusLabel(req.status)}
                      </span>
                      <span style={{fontSize:'0.75rem', color:'#94a3b8'}}>
                        {new Date(req.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* دکمه‌های کنترل */}
                  <div style={{display:'flex', flexDirection:'column', gap:6, minWidth:100}}>
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(req.id, 'accepted')}
                          disabled={loading === req.id}
                          style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background:'#ecfdf5', color:'#10b981', fontWeight:500}}>
                          {loading === req.id ? '...' : '✅ قبول'}
                        </button>
                        <button onClick={() => handleStatus(req.id, 'rejected')}
                          disabled={loading === req.id}
                          style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background:'#fef2f2', color:'#ef4444', fontWeight:500}}>
                          {loading === req.id ? '...' : '❌ رد'}
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(req.id)}
                      disabled={loading === req.id}
                      style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background:'#f1f5f9', color:'#64748b', fontWeight:500}}>
                      🗑 حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
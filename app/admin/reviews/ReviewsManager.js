'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminLayout from '../AdminLayout'

export default function ReviewsManager({ reviews, adminName }) {
  const [loading, setLoading] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle(reviewId, isActive) {
    setLoading(reviewId)
    await supabase.from('reviews').update({ is_active: !isActive }).eq('id', reviewId)
    router.refresh()
    setLoading(null)
  }

  async function handleDelete(reviewId) {
    if (!confirm('این نظر حذف شود؟')) return
    setLoading(reviewId)
    await supabase.from('reviews').delete().eq('id', reviewId)
    router.refresh()
    setLoading(null)
  }

  return (
    <AdminLayout adminName={adminName}>
      <div>
        <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem'}}>مدیریت نظرات</h2>

        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          {reviews.length === 0 ? (
            <div style={{textAlign:'center', padding:'3rem', color:'#94a3b8'}}>نظری ثبت نشده</div>
          ) : reviews.map(review => (
            <div key={review.id}
              style={{background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', opacity: !review.is_active ? 0.6 : 1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:6}}>
                    <span style={{fontWeight:600, color:'#0f172a', fontSize:'0.875rem'}}>{review.profiles?.full_name || 'کاربر'}</span>
                    <span style={{fontSize:'0.75rem', color:'#94a3b8'}}>درباره:</span>
                    <span style={{fontSize:'0.8rem', color:'#6366f1'}}>{review.books?.title}</span>
                  </div>
                  <div style={{display:'flex', marginBottom:6}}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{fontSize:'0.9rem'}}>{s <= review.rating ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                  {review.comment && (
                    <p style={{fontSize:'0.875rem', color:'#475569'}}>{review.comment}</p>
                  )}
                  <p style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:6}}>
                    {new Date(review.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div style={{display:'flex', gap:6, marginRight:16}}>
                  <button onClick={() => handleToggle(review.id, review.is_active)}
                    disabled={loading === review.id}
                    style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background: review.is_active ? '#fffbeb' : '#ecfdf5', color: review.is_active ? '#f59e0b' : '#10b981', fontWeight:500}}>
                    {loading === review.id ? '...' : review.is_active ? 'غیرفعال' : 'فعال'}
                  </button>
                  <button onClick={() => handleDelete(review.id)}
                    disabled={loading === review.id}
                    style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background:'#fef2f2', color:'#ef4444', fontWeight:500}}>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
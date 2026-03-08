'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminLayout from '../AdminLayout'

export default function BooksManager({ books, adminName }) {
  const [loading, setLoading] = useState(null)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggle(bookId, isActive) {
    setLoading(bookId)
    await supabase.from('books')
      .update({ is_active: !isActive, is_available: isActive })
      .eq('id', bookId)
    router.refresh()
    setLoading(null)
  }

  async function handleDelete(bookId) {
    if (!confirm('آیا مطمئنید؟ این عمل قابل بازگشت نیست.')) return
    setLoading(bookId)
    await supabase.from('books').delete().eq('id', bookId)
    router.refresh()
    setLoading(null)
  }

  return (
    <AdminLayout adminName={adminName}>
      <div>
        <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem'}}>مدیریت کتاب‌ها</h2>

        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس عنوان یا نویسنده..."
          style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 16px', marginBottom:'1.5rem', fontSize:'0.875rem', outline:'none', background:'#fff'}} />

        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.875rem'}}>
            <thead>
              <tr style={{background:'#f8fafc', borderBottom:'1px solid #e2e8f0'}}>
                {['کتاب','صاحب','نوع','وضعیت','عملیات'].map(h => (
                  <th key={h} style={{textAlign:'right', padding:'12px 16px', color:'#475569', fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(book => (
                <tr key={book.id} style={{borderBottom:'1px solid #f1f5f9', background: !book.is_active ? '#fef2f2' : '#fff'}}>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{fontWeight:600, color:'#0f172a'}}>{book.title}</div>
                    <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>{book.author}</div>
                  </td>
                  <td style={{padding:'12px 16px', color:'#475569'}}>{book.profiles?.full_name || '—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                      {book.offer_type?.map(type => (
                        <span key={type} style={{fontSize:'0.7rem', padding:'3px 8px', borderRadius:20, background:'#f1f5f9', color:'#475569'}}>
                          {type === 'borrow' ? 'قرض' : type === 'gift' ? 'هدیه' : 'فروش'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{fontSize:'0.75rem', padding:'4px 10px', borderRadius:20, background: book.is_active ? '#ecfdf5' : '#fef2f2', color: book.is_active ? '#10b981' : '#ef4444', fontWeight:500}}>
                      {book.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex', gap:6}}>
                      <button onClick={() => handleToggle(book.id, book.is_active)}
                        disabled={loading === book.id}
                        style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background: book.is_active ? '#fffbeb' : '#ecfdf5', color: book.is_active ? '#f59e0b' : '#10b981', fontWeight:500}}>
                        {loading === book.id ? '...' : book.is_active ? 'غیرفعال' : 'فعال'}
                      </button>
                      <button onClick={() => handleDelete(book.id)}
                        disabled={loading === book.id}
                        style={{fontSize:'0.75rem', padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', background:'#fef2f2', color:'#ef4444', fontWeight:500}}>
                        حذف
                      </button>
                    </div>
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
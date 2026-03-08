import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // چک کردن مسدودیت
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned, role')
      .eq('id', user.id)
      .single()

    // اگر مسدود شده، خارج کن
    if (profile?.is_banned) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?banned=true', request.url))
    }
  }

  // صفحاتی که نیاز به لاگین دارند
  const protectedRoutes = ['/dashboard', '/books/add', '/books/edit']
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
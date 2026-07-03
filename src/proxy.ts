// Bản quyền thuộc dalymmo.com
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth middleware - refreshes session and redirects unauthenticated users
 */
export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Lấy session từ Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- BẮT ĐẦU: KIỂM TRA DOMAIN WHITELIST ---
  const host = request.headers.get('host') || ''
  const domain = host.split(':')[0].toLowerCase() // Lấy domain (bỏ port nếu có)

  // Bỏ qua kiểm tra cho các đường dẫn tĩnh, mặc dù matcher đã chặn rồi
  // Khởi tạo Supabase Admin client để query SystemParameter không bị vướng RLS
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )

  const { data: allowedDomainsParam } = await supabaseAdmin
    .from('SystemParameter')
    .select('value')
    .eq('key', 'ALLOWED_DOMAINS')
    .limit(1)

  if (allowedDomainsParam && allowedDomainsParam.length > 0 && allowedDomainsParam[0].value) {
    // Tách chuỗi bằng dấu phẩy và làm sạch
    const allowedList = allowedDomainsParam[0].value
      .split(',')
      .map((d: string) => d.trim().toLowerCase())
      .filter(Boolean)

    if (allowedList.length > 0) {
      // Nếu không có tên miền nào khớp với danh sách cho phép
      if (!allowedList.includes(domain)) {
        return new NextResponse(
          `<!DOCTYPE html><html><head><title>403 Forbidden</title><meta charset="utf-8"></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f87171;color:white;text-align:center;"><div><h1 style="font-size:3rem;margin-bottom:0.5rem">403 Forbidden</h1><p>Tên miền truy cập (<b>${domain}</b>) chưa được cấp phép truy cập vào hệ thống này.</p></div></body></html>`,
          { status: 403, headers: { 'content-type': 'text/html' } }
        )
      }
    }
  }
  // --- KẾT THÚC: KIỂM TRA DOMAIN WHITELIST ---

  // Protected routes - redirect to login if not authenticated
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/barns') ||
    request.nextUrl.pathname.startsWith('/pigs') ||
    request.nextUrl.pathname.startsWith('/breeding') ||
    request.nextUrl.pathname.startsWith('/health') ||
    request.nextUrl.pathname.startsWith('/inventory') ||
    request.nextUrl.pathname.startsWith('/finance') ||
    request.nextUrl.pathname.startsWith('/employees') ||
    request.nextUrl.pathname.startsWith('/tasks') ||
    request.nextUrl.pathname.startsWith('/reports') ||
    request.nextUrl.pathname.startsWith('/audit-log') ||
    request.nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }


  // Auth routes - redirect to dashboard if already authenticated
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Root redirect
  if (request.nextUrl.pathname === '/') {
    if (user) {
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() { return [] },
            setAll() {},
          },
        }
      )
      
      const { data: dbUser } = await supabaseAdmin
        .from('User')
        .select('isActive')
        .eq('supabaseId', user.id)
        .single()

      if (dbUser && !dbUser.isActive) {
        return NextResponse.redirect(new URL('/pending-approval', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

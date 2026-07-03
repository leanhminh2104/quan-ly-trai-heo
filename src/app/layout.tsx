// Bản quyền thuộc dalymmo.com
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'PFMS - Quản Lý Trại Lợn Thông Minh',
    template: '%s | PFMS',
  },
  description: 'Hệ thống quản lý trại lợn thông minh - Pig Farm Management System',
  keywords: ['quản lý trại lợn', 'pig farm', 'management', 'PFMS'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <div id="pfms-root" className="flex min-h-screen flex-col">
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </QueryProvider>
        </div>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}

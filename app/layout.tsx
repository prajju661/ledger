import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LifeLedger AI — Your Personal Life OS',
  description:
    'Track your items, manage routines, log activities, and get AI-powered insights about your life.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg-surface text-text-primary font-sans">
        <BackgroundOrbs />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 15, 26, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#f1f5f9',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0f0f1a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f0f1a' },
            },
          }}
        />
      </body>
    </html>
  )
}

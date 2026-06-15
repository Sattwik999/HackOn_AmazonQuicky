import { CartProvider } from '@/components/cart-context'
import { QuickyProvider } from '@/components/quicky-context'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Amazon Quicky - Shop with AI Assistant',
  description: 'Shop faster with Amazon Quicky AI-powered shopping assistant. Build budget-aware carts, compare products, and reorder essentials in seconds.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/playstore.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/playstore.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/playstore.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/playstore.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#131921' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <QuickyProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </QuickyProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Les Tsabloz',
  description: 'Book your stay at Les Tsabloz',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-stone-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

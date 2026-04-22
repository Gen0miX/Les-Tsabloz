import type { Metadata } from 'next'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const display = Fraunces({
  variable: '--lt-font-display',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
})
const ui = Inter({
  variable: '--lt-font-ui',
  subsets: ['latin'],
})
const mono = JetBrains_Mono({
  variable: '--lt-font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Les Tsabloz',
  description: 'Chalet privé — Val d’Anniviers, Valais',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${ui.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="lt-root min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

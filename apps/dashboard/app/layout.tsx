import type { Metadata } from 'next'
import './globals.css'
import Nav from '../components/Nav'

export const metadata: Metadata = { title: 'AIC Dashboard', description: 'Autonomous AI Company' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}

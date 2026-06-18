import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { NavLinks } from '../components/NavLinks'
import { getPresenceStatus } from '../lib/presence'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevFlow',
  description: 'Dev team dashboard',
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const tcStatus = getPresenceStatus('TC')
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex h-full antialiased">
        {/* Sidebar */}
        <aside className="flex w-56 shrink-0 flex-col bg-[#111318]">
          {/* Logo */}
          <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 shadow-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">DevFlow</span>
          </div>

          {/* Nav links (client component for active state) */}
          <NavLinks />

          {/* User */}
          <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                TC
                <span
                  aria-label={`${tcStatus}: TC`}
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${tcStatus === 'online' ? 'bg-emerald-500' : tcStatus === 'away' ? 'bg-amber-500' : 'bg-gray-400'}`}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">Tiberiu Ciceu</p>
                <p className="truncate text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',         label: 'Workflows' },
  { href: '/agents',   label: 'Agents' },
  { href: '/memory',   label: 'Memory' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-14">
        <span className="text-green-400 font-bold text-lg tracking-tight">AIC</span>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`text-sm font-medium transition-colors ${path === l.href ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            {l.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          <span>3 services running</span>
        </div>
      </div>
    </header>
  )
}

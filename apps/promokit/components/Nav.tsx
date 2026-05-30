'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)', boxShadow: '0 0 20px rgba(255,107,26,0.4)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
            </svg>
          </div>
          <div>
            <span className="font-black text-xl text-white tracking-tight">PromoKit</span>
            <span className="block text-[11px] leading-none" style={{ color: 'rgba(255,107,26,0.8)', fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              प्रमोकिट
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-10">
          {[
            { label: 'How it Works', href: '#how-it-works' },
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Testimonials', href: '#testimonials' },
          ].map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-150">
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/create" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/create" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl">
            Start Free — No Card Needed
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden text-white/70 hover:text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 px-6 py-6 flex flex-col gap-5" style={{ background: 'rgba(15,15,26,0.98)' }}>
          {['How it Works', 'Features', 'Pricing', 'Testimonials'].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="text-white/70 hover:text-white font-medium" onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          <Link href="/create" className="btn-primary text-center px-6 py-3.5 font-bold rounded-xl mt-2">
            Start Free →
          </Link>
        </div>
      )}
    </nav>
  );
}

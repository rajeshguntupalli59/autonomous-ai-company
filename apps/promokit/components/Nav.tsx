'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" strokeWidth="0"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">PromoKit</span>
            <span
              className="block text-[10px] leading-none"
              style={{ color: 'rgba(255,107,26,0.8)', fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              प्रमोकिट
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
            Features
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="btn-primary hidden sm:inline-flex items-center gap-1 px-5 py-2.5 text-sm font-semibold"
          >
            Start Free →
          </Link>
          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/70 hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          <a href="#how-it-works" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>How it Works</a>
          <a href="#pricing" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#features" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Features</a>
          <Link href="/create" className="btn-primary text-center px-5 py-3 font-semibold">
            Start Free →
          </Link>
        </div>
      )}
    </nav>
  );
}

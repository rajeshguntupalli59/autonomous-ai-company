'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-base" style={{ paddingTop: '80px' }}>
      {/* India tricolor strip */}
      <div className="india-strip">
        <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
        <div style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
        <div style={{ flex: 1, backgroundColor: '#138808' }} />
      </div>

      {/* Gradient orbs */}
      <div className="orb" style={{ width: '800px', height: '800px', top: '-200px', right: '-200px', background: 'radial-gradient(circle, rgba(255,107,26,0.15) 0%, transparent 65%)' }} />
      <div className="orb" style={{ width: '600px', height: '600px', bottom: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)' }} />
      <div className="orb" style={{ width: '400px', height: '400px', top: '50%', left: '35%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex-1 flex items-center w-full max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center w-full">

          {/* Left: Copy */}
          <div className="animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{ background: 'rgba(255,107,26,0.12)', border: '1px solid rgba(255,107,26,0.3)', color: '#FF6B1A' }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow inline-block" />
              AI-powered · Free to start · India-first
            </div>

            <h1 className="font-black leading-[1.05] tracking-tight mb-8" style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)' }}>
              Promote Your<br />Business.{' '}
              <span style={{ background: 'linear-gradient(135deg, #FF6B1A 0%, #FFAD6B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                In Your<br />Language.
              </span>{' '}
              In 2 Minutes.
            </h1>

            <p className="text-xl text-white/55 mb-10 leading-relaxed max-w-lg">
              AI writes your <span className="text-white/90 font-semibold">WhatsApp messages, Instagram posts & flyers</span> — in Hindi, Telugu, Tamil and 4 more languages. No design skills. No marketing degree.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/create" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl">
                Create Your PromoKit Free →
              </Link>
              <a href="#how-it-works" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl">
                See How It Works ↓
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex -space-x-2">
                {['🏪','💈','🍛','💊','👗','🔧'].map((e, i) => (
                  <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-base border-2 border-base" style={{ background: '#1a1a2e', zIndex: 6 - i }}>{e}</div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Trusted by 2,400+ business owners</div>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#FF6B1A"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                  <span className="text-xs text-white/40 ml-1.5">4.9 / 5 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Browser window mockup */}
          <div className="hidden lg:flex justify-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="animate-float w-full max-w-[620px] relative">
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(ellipse at center, rgba(255,107,26,0.2) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'scale(1.2)' }} />

              {/* Browser chrome */}
              <div className="browser-window relative">
                {/* Title bar */}
                <div className="browser-titlebar">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <div className="browser-url">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    promokit.in/results
                  </div>
                  <div className="w-16" />
                </div>

                {/* Browser content */}
                <div className="browser-content">
                  {/* App header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0f1a' }}>
                    <div>
                      <div className="text-sm font-bold text-white">🎉 Your PromoKit is Ready!</div>
                      <div className="text-xs" style={{ color: 'rgba(255,107,26,0.8)' }}>Ram Kirana Store — Kukatpally, Hyderabad</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>Share Link</div>
                      <div className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.2)' }}>Regenerate</div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-0 border-b px-5" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0a10' }}>
                    {['💬 WhatsApp','📸 Instagram','👍 Facebook','📍 Google','🖼️ Flyer'].map((tab, i) => (
                      <div key={tab} className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap" style={i === 0 ? { color: '#FF6B1A', borderBottom: '2px solid #FF6B1A', marginBottom: '-1px' } : { color: 'rgba(255,255,255,0.4)' }}>
                        {tab}
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3" style={{ background: '#050508' }}>
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>3 Messages Generated</div>

                    {/* Message 1 */}
                    <div className="rounded-xl p-4 relative" style={{ background: '#0f1a12', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <div className="text-sm leading-relaxed" style={{ color: '#e9edef' }}>
                        🛒 <strong style={{ color: '#4ade80' }}>राम किराना स्टोर</strong> में आपका स्वागत है!<br />
                        आज का खास ऑफर — चावल 25kg सिर्फ ₹850 🎉<br />
                        📍 कुकटपल्ली · 📞 98765 43210
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>WhatsApp ready · Hindi</span>
                        <div className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>Copy ✓</div>
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="rounded-xl p-4 relative" style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="text-sm leading-relaxed text-white/70">
                        🎊 <strong className="text-white">दीपावली स्पेशल</strong> — इस हफ्ते 10% अतिरिक्त छूट! सिर्फ 5 दिन बाकी ⏰ ऑर्डर के लिए मैसेज करें 👇
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Festival template · Hindi</span>
                        <div className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>Copy</div>
                      </div>
                    </div>

                    {/* Upsell */}
                    <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.08), rgba(255,140,66,0.04))', border: '1px solid rgba(255,107,26,0.2)' }}>
                      <span className="text-xs text-white/60">⚡ Upgrade to get <strong className="text-white">unlimited messages</strong> in all 7 languages</span>
                      <span className="text-xs font-bold ml-3 whitespace-nowrap" style={{ color: '#FF6B1A' }}>₹299/mo →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 border-t w-full" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(15,15,26,0.6)' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: '2,400+', label: 'Businesses using PromoKit' },
            { val: '7', label: 'Indian languages supported' },
            { val: '₹0', label: 'To get started' },
            { val: '2 min', label: 'Average setup time' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center py-6">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/25">Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="M7 10l5 5 5-5"/></svg>
        </div>
      </div>
    </section>
  );
}

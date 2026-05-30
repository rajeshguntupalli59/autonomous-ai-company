'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-base" style={{ paddingTop: '64px' }}>
      {/* India flag strip */}
      <div className="india-strip">
        <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
        <div style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
        <div style={{ flex: 1, backgroundColor: '#138808' }} />
      </div>

      {/* Gradient orbs */}
      <div
        className="orb"
        style={{
          width: '600px',
          height: '600px',
          top: '-100px',
          right: '-150px',
          background: 'radial-gradient(circle, rgba(255,107,26,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-100px',
          left: '-100px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: '300px',
          height: '300px',
          top: '40%',
          left: '40%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex-1 flex items-center max-w-6xl mx-auto px-4 sm:px-6 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Left: Copy */}
          <div className="animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{
                background: 'rgba(255,107,26,0.12)',
                border: '1px solid rgba(255,107,26,0.3)',
                color: '#FF6B1A',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow inline-block" />
              AI-powered · Instant · Free to start
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Promote Your Business.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                In Your Language.
              </span>{' '}
              In 2 Minutes.
            </h1>

            <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-xl">
              AI writes your WhatsApp messages, Instagram posts &amp; flyers — in{' '}
              <span className="text-white/90 font-medium">Hindi, Telugu, Tamil</span> and more.
              No design skills needed. No marketing degree required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/create"
                className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold rounded-xl"
              >
                Create Your PromoKit Free →
              </Link>
              <a
                href="#how-it-works"
                className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold rounded-xl"
              >
                See How It Works ↓
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex -space-x-2">
                {['🏪', '💈', '🍛', '💊', '👗'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 border-base"
                    style={{ background: '#1a1a2e', zIndex: 5 - i }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Trusted by 2,400+ business owners
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FF6B1A">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="text-xs text-white/50 ml-1">4.9 / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up delay-300">
            <div className="animate-float relative">
              {/* Glow behind phone */}
              <div
                className="absolute inset-0 rounded-[40px]"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,107,26,0.25) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  transform: 'scale(1.3)',
                }}
              />

              {/* Phone body */}
              <div
                className="phone-mockup relative"
                style={{ width: '280px', height: '560px' }}
              >
                {/* Status bar */}
                <div className="flex justify-between items-center px-6 pt-8 pb-4">
                  <span className="text-[11px] text-white/40 font-medium">9:41</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-3 h-2 rounded-sm border border-white/30" />
                    <div className="w-3 h-3 rounded-full border border-white/30" />
                    <div className="w-3 h-3 border border-white/30 rounded-sm" />
                  </div>
                </div>

                {/* WhatsApp header */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
                  <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-sm font-bold text-white">
                    R
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Ram Kirana Store</div>
                    <div className="text-green-300 text-[11px]">Online</div>
                  </div>
                </div>

                {/* Chat background */}
                <div
                  className="flex-1 p-4 space-y-3"
                  style={{
                    background: '#0D1418',
                    height: '380px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Received message */}
                  <div
                    className="rounded-xl rounded-tl-none p-3 text-[12px] leading-relaxed"
                    style={{ background: '#1F2C34', color: '#e9edef', maxWidth: '80%' }}
                  >
                    🛒 आज का स्पेशल ऑफर!
                  </div>

                  {/* Sent message */}
                  <div className="whatsapp-bubble text-[12px] leading-relaxed">
                    🎉 <strong>राम किराना स्टोर</strong> में आपका स्वागत है!<br /><br />
                    आज का खास ऑफर 🛒<br />
                    ✅ चावल 25kg — ₹850 (₹950 की जगह)<br />
                    ✅ आटा 10kg — ₹320<br />
                    ✅ दाल 5kg — ₹450<br /><br />
                    📍 कुकटपल्ली, हैदराबाद<br />
                    📞 98765 43210
                  </div>

                  {/* Time */}
                  <div className="text-right text-[10px] text-white/30 pr-2">
                    10:30 AM ✓✓
                  </div>

                  {/* Second message */}
                  <div className="whatsapp-bubble text-[12px] leading-relaxed">
                    🎊 <strong>दीपावली स्पेशल</strong> — इस हफ्ते 10% अतिरिक्त छूट!<br />
                    सिर्फ 5 दिन बाकी ⏰<br /><br />
                    ऑर्डर के लिए मैसेज करें 👇
                  </div>

                  {/* PromoKit badge */}
                  <div
                    className="text-center text-[10px] py-1 rounded-full"
                    style={{ color: 'rgba(255,107,26,0.6)', background: 'rgba(255,107,26,0.08)' }}
                  >
                    ⚡ Generated by PromoKit AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/30">Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </div>
      </div>
    </section>
  );
}

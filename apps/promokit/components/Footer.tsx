import Link from 'next/link';

const links = {
  Product: ['How it Works', 'Features', 'Pricing', 'Examples'],
  Languages: ['Hindi', 'Telugu', 'Tamil', 'Marathi', 'Kannada', 'Bengali'],
  Company: ['About', 'Blog', 'Contact', 'Privacy Policy'],
};

export default function Footer() {
  return (
    <footer style={{ background: '#050508', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg text-white">PromoKit</span>
                <span
                  className="block text-[10px] leading-none"
                  style={{ color: 'rgba(255,107,26,0.8)', fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                >
                  प्रमोकिट
                </span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              AI-powered marketing content for Indian small businesses. Write promotions in your language, instantly.
            </p>
            <div className="flex gap-3">
              {/* Social icons */}
              {[
                { label: 'WhatsApp', icon: '💬' },
                { label: 'Instagram', icon: '📸' },
                { label: 'Twitter', icon: '🐦' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white/80 font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/30 text-sm">
            © 2024 PromoKit. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Made with ❤️ for India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}

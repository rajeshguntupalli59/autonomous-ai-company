'use client';

import { useState } from 'react';

const tabs = ['WhatsApp', 'Instagram', 'Flyer'] as const;
type Tab = typeof tabs[number];

const sampleContent: Record<Tab, React.ReactNode> = {
  WhatsApp: (
    <div className="space-y-3 p-4">
      <div
        className="rounded-xl rounded-tl-none p-3 text-sm"
        style={{ background: '#1F2C34', color: '#e9edef', maxWidth: '75%', lineHeight: '1.6' }}
      >
        🛒 कोई ऑफर है क्या?
      </div>
      <div
        className="rounded-xl rounded-tr-none p-3 text-sm ml-auto"
        style={{ background: '#005C4B', color: '#e9edef', maxWidth: '85%', lineHeight: '1.6' }}
      >
        🎉 <strong>श्री गणेश किराना स्टोर</strong> में आपका स्वागत है!<br /><br />
        आज का खास ऑफर 🛒<br />
        ✅ बासमती चावल 5kg — ₹285<br />
        ✅ सरसों तेल 1L — ₹145<br />
        ✅ बेसन 1kg — ₹65<br /><br />
        📍 लक्ष्मी नगर, दिल्ली<br />
        📞 98100 12345<br /><br />
        आज ही आएं, कल का इंतज़ार न करें! 🙏
      </div>
      <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        11:45 AM ✓✓
      </div>
    </div>
  ),
  Instagram: (
    <div className="p-4 space-y-3">
      {/* Fake post */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-32 flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, #FF6B1A22, #6366F122)' }}
        >
          🛒
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">S</div>
            <span className="text-xs font-semibold text-white/80">@shriganesha_kirana</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            🌟 आज का स्पेशल! ताज़ी सब्ज़ियाँ और किराना — सीधे आपके दरवाज़े तक 🏪<br /><br />
            💰 इस हफ्ते ₹500+ की खरीद पर FREE डिलीवरी!<br /><br />
            #DelhiKirana #GroceryDelivery #किराना #FreshVeggies #Delhi
          </p>
        </div>
      </div>
    </div>
  ),
  Flyer: (
    <div className="p-4">
      <div
        className="rounded-2xl overflow-hidden p-5 text-center"
        style={{
          background: 'linear-gradient(145deg, #1a0a00, #2a1200)',
          border: '2px solid rgba(255,107,26,0.3)',
        }}
      >
        <div className="text-2xl mb-2">🛕</div>
        <div
          className="text-lg font-black text-white mb-1"
          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        >
          श्री गणेश किराना
        </div>
        <div className="text-xs text-orange-400 mb-3">Shri Ganesh Kirana Store</div>
        <div
          className="h-px mb-3"
          style={{ background: 'rgba(255,107,26,0.3)' }}
        />
        <div className="text-sm font-bold text-white mb-1">🎉 दीपावली स्पेशल ऑफर!</div>
        <div className="text-xs text-white/60 mb-3">सभी सामान पर 15% छूट</div>
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(255,107,26,0.2)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.4)' }}
        >
          Valid till 3 Nov 2024
        </div>
        <div className="mt-3 text-xs text-white/40">📍 लक्ष्मी नगर, दिल्ली · 📞 98100 12345</div>
      </div>
    </div>
  ),
};

export default function LivePreview() {
  const [activeTab, setActiveTab] = useState<Tab>('WhatsApp');

  return (
    <section className="py-24 lg:py-32 relative" style={{ background: '#050508' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
          >
            Live Preview
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            See What Gets{' '}
            <span style={{ background: 'linear-gradient(135deg, #22C55E, #4ADE80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Generated
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Real content for a real kirana store. Enter your details and get this for your business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Business form mockup (read-only) */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#FF6B1A', color: 'white' }}
              >
                1
              </div>
              <span className="text-sm font-semibold text-white/80">Business Details (Sample)</span>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Business Name', value: 'श्री गणेश किराना स्टोर' },
                { label: 'Business Type', value: 'Kirana Store' },
                { label: 'What you sell', value: 'Fresh vegetables, groceries, dairy, pulses, cooking oil...' },
                { label: 'City & Area', value: 'Laxmi Nagar, Delhi' },
                { label: 'WhatsApp', value: '+91 98100 12345' },
                { label: 'Language', value: 'हिन्दी (Hindi)' },
                { label: 'Tone', value: 'Friendly & Warm' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-white/40 mb-1">{label}</div>
                  <div
                    className="px-3 py-2.5 rounded-lg text-sm text-white/80"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              This is a sample. Your real content will be personalised.
            </div>
          </div>

          {/* Right: Output tabs */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Tab bar */}
            <div
              className="flex border-b"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3.5 text-sm font-medium transition-all duration-200"
                  style={
                    activeTab === tab
                      ? { color: '#FF6B1A', borderBottom: '2px solid #FF6B1A', marginBottom: '-1px' }
                      : { color: 'rgba(255,255,255,0.4)', borderBottom: '2px solid transparent', marginBottom: '-1px' }
                  }
                >
                  {tab === 'WhatsApp' && '💬 '}
                  {tab === 'Instagram' && '📸 '}
                  {tab === 'Flyer' && '📄 '}
                  {tab}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div
              style={{
                background: activeTab === 'WhatsApp' ? '#0D1418' : '#0F0F1A',
                minHeight: '320px',
              }}
            >
              {sampleContent[activeTab]}
            </div>

            {/* Copy action bar */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-xs text-white/30">Sample output for कुकटपल्ली, हैदराबाद</span>
              <a
                href="/create"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.3)' }}
              >
                Generate Yours →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

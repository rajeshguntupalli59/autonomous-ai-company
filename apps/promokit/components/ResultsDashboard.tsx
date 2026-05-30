'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type GeneratedData = {
  whatsapp: string[];
  instagram: string[];
  facebook: string[];
  google: string;
  flyerTagline: string;
  flyerHighlight: string;
};

type ResultPayload = {
  success: boolean;
  data: GeneratedData;
  business: {
    businessName: string;
    businessType: string;
    location: string;
    whatsapp: string;
    language: string;
  };
};

type Tab = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Google' | 'Flyer';

const TABS: Tab[] = ['WhatsApp', 'Instagram', 'Facebook', 'Google', 'Flyer'];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
      style={
        copied
          ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
      }
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied ✓
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function MessageCard({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="rounded-xl p-5 group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A' }}
        >
          Version {index + 1}
        </span>
        <CopyButton text={text} />
      </div>
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

export default function ResultsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('WhatsApp');
  const [result, setResult] = useState<ResultPayload | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('promokit_result');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-3">No results found</h2>
          <p className="text-white/40 mb-6">Please generate a PromoKit first.</p>
          <Link href="/create" className="btn-primary px-6 py-3 rounded-xl font-semibold inline-block">
            Create PromoKit →
          </Link>
        </div>
      </div>
    );
  }

  const { data, business } = result;

  const tabIcon: Record<Tab, string> = {
    WhatsApp: '💬',
    Instagram: '📸',
    Facebook: '👥',
    Google: '🔍',
    Flyer: '📄',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'WhatsApp':
        return (
          <div className="space-y-4">
            {(data.whatsapp || []).map((msg, i) => (
              <MessageCard key={i} text={msg} index={i} />
            ))}
          </div>
        );
      case 'Instagram':
        return (
          <div className="space-y-4">
            {(data.instagram || []).map((caption, i) => (
              <MessageCard key={i} text={caption} index={i} />
            ))}
          </div>
        );
      case 'Facebook':
        return (
          <div className="space-y-4">
            {(data.facebook || []).map((post, i) => (
              <MessageCard key={i} text={post} index={i} />
            ))}
          </div>
        );
      case 'Google':
        return (
          <div>
            <div
              className="rounded-xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  <span className="text-sm font-semibold text-white/80">Google Business Description</span>
                </div>
                <CopyButton text={data.google || ''} />
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{data.google}</p>
              <div
                className="mt-4 p-3 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <p className="text-xs text-white/40">
                  💡 <strong className="text-white/60">How to use:</strong> Go to Google Business Profile → Edit profile → Business description → Paste this text.
                </p>
              </div>
            </div>
          </div>
        );
      case 'Flyer':
        return (
          <div>
            {/* Rendered flyer */}
            <div
              id="promo-flyer"
              className="rounded-2xl overflow-hidden mb-6"
              style={{
                background: 'linear-gradient(145deg, #1a0a00, #130800)',
                border: '2px solid rgba(255,107,26,0.4)',
                maxWidth: '480px',
                margin: '0 auto 24px',
              }}
            >
              <div
                className="p-6 text-center"
                style={{ borderBottom: '1px solid rgba(255,107,26,0.2)' }}
              >
                <div className="text-4xl mb-3">🏪</div>
                <h2
                  className="text-2xl font-black text-white mb-1"
                  style={{ fontFamily: business.language === 'Hindi' || business.language === 'Marathi' ? "'Noto Sans Devanagari', sans-serif" : 'Inter, sans-serif' }}
                >
                  {business.businessName}
                </h2>
                <p className="text-orange-400 text-sm font-medium">{business.businessType} · {business.location}</p>
              </div>

              <div className="p-6 text-center">
                <div
                  className="inline-block px-5 py-2 rounded-full text-sm font-bold mb-4"
                  style={{ background: 'rgba(255,107,26,0.2)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.4)' }}
                >
                  🎉 Special Offer
                </div>
                <p className="text-xl font-bold text-white mb-2">{data.flyerTagline || 'Quality products at the best prices!'}</p>
                <p className="text-white/60 text-sm mb-4">{data.flyerHighlight || 'Visit us today for exclusive deals'}</p>

                <div
                  className="h-px mb-4"
                  style={{ background: 'rgba(255,107,26,0.2)' }}
                />

                <div className="space-y-2 text-sm">
                  {business.location && (
                    <div className="flex items-center justify-center gap-2 text-white/60">
                      <span>📍</span> {business.location}
                    </div>
                  )}
                  {business.whatsapp && (
                    <div className="flex items-center justify-center gap-2 text-white/60">
                      <span>📞</span> {business.whatsapp}
                    </div>
                  )}
                </div>

                <div
                  className="mt-4 pt-3 text-xs text-white/25"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  ⚡ Generated by PromoKit AI
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => window.print()}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
              >
                🖨️ Download / Print Flyer
              </button>
              <p className="text-xs text-white/30 mt-2">Use Ctrl+P → Save as PDF for best results</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: '#050508' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Your PromoKit is Ready!
          </h1>
          <p className="text-white/50 text-lg">
            {business.businessName} · {business.language}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard?.writeText(url);
              }}
              className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              🔗 Share Link
            </button>
            <Link
              href="/create"
              className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              🔄 Regenerate
            </Link>
          </div>
        </div>

        {/* Tab navigation */}
        <div
          className="flex overflow-x-auto mb-6 rounded-xl"
          style={{
            background: '#141424',
            border: '1px solid rgba(255,255,255,0.07)',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap px-2"
              style={
                activeTab === tab
                  ? {
                      color: '#FF6B1A',
                      borderBottom: '2px solid #FF6B1A',
                      background: 'rgba(255,107,26,0.06)',
                    }
                  : {
                      color: 'rgba(255,255,255,0.4)',
                      borderBottom: '2px solid transparent',
                    }
              }
            >
              {tabIcon[tab]} {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="rounded-2xl p-5 sm:p-7"
          style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.07)', minHeight: '300px' }}
        >
          {renderContent()}
        </div>

        {/* Upsell banner */}
        <div
          className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,26,0.12), rgba(99,102,241,0.08))',
            border: '1px solid rgba(255,107,26,0.25)',
          }}
        >
          <div>
            <div className="font-bold text-white text-lg mb-1">⭐ Upgrade to Starter — ₹299/mo</div>
            <p className="text-white/50 text-sm">
              Unlimited generations · All 7 languages · Festival templates · PDF flyers · QR page
            </p>
          </div>
          <Link
            href="/#pricing"
            className="btn-primary whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0"
          >
            Upgrade Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type FormData = {
  businessName: string;
  businessType: string;
  description: string;
  location: string;
  whatsapp: string;
  language: string;
  tone: string;
  festivals: boolean;
};

const BUSINESS_TYPES = [
  'Kirana Store', 'Restaurant', 'Salon', 'Clinic', 'Boutique',
  'Pharmacy', 'Electronics', 'Bakery', 'Gym', 'Tuition Centre', 'Other',
];

const LANGUAGES = [
  { code: 'Hindi', label: 'हिन्दी', sub: 'Hindi' },
  { code: 'Telugu', label: 'తెలుగు', sub: 'Telugu' },
  { code: 'Tamil', label: 'தமிழ்', sub: 'Tamil' },
  { code: 'Marathi', label: 'मराठी', sub: 'Marathi' },
  { code: 'Kannada', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  { code: 'Bengali', label: 'বাংলা', sub: 'Bengali' },
  { code: 'English', label: 'English', sub: 'English' },
];

const TONES = [
  { value: 'Friendly & Warm', icon: '😊', desc: 'Conversational, personal, like a neighbour' },
  { value: 'Professional', icon: '💼', desc: 'Clean, trustworthy, brand-focused' },
  { value: 'Festive & Energetic', icon: '🎉', desc: 'High energy, celebratory, exciting offers' },
];

export default function BusinessForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormData>({
    businessName: '',
    businessType: '',
    description: '',
    location: '',
    whatsapp: '',
    language: 'Hindi',
    tone: 'Friendly & Warm',
    festivals: true,
  });

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      localStorage.setItem('promokit_result', JSON.stringify(json));
      router.push('/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#050508' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Create Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              PromoKit
            </span>
          </h1>
          <p className="text-white/50">Fill in your details and get AI-written promotions instantly</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {['Business Info', 'Preferences', 'Review'].map((label, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm"
                style={{ color: step > i + 1 ? '#22C55E' : step === i + 1 ? '#FF6B1A' : 'rgba(255,255,255,0.3)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border"
                  style={{
                    background: step > i + 1 ? '#22C55E20' : step === i + 1 ? '#FF6B1A20' : 'transparent',
                    borderColor: step > i + 1 ? '#22C55E' : step === i + 1 ? '#FF6B1A' : 'rgba(255,255,255,0.15)',
                    color: step > i + 1 ? '#22C55E' : step === i + 1 ? '#FF6B1A' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span> Business Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="form-label">Business Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. श्री गणेश किराना स्टोर"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Business Type *</label>
                  <select
                    className="form-input"
                    value={form.businessType}
                    onChange={(e) => set('businessType', e.target.value)}
                    required
                  >
                    <option value="">Select business type...</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">What do you sell / offer? *</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Fresh vegetables, groceries, dairy products, household items, spices..."
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">City &amp; Area *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Kukatpally, Hyderabad"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!form.businessName || !form.businessType || !form.description || !form.location) {
                    setError('Please fill in all required fields.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                className="btn-primary w-full mt-8 py-4 font-bold rounded-xl text-base"
              >
                Continue to Preferences →
              </button>
              {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🌐</span> Preferences
              </h2>

              {/* Language */}
              <div className="mb-7">
                <label className="form-label text-base mb-3">Choose Language *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => set('language', lang.code)}
                      className="p-3 rounded-xl text-center transition-all duration-200"
                      style={{
                        background: form.language === lang.code ? 'rgba(255,107,26,0.15)' : 'rgba(255,255,255,0.04)',
                        border: form.language === lang.code
                          ? '1px solid rgba(255,107,26,0.6)'
                          : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: form.language === lang.code ? '0 0 12px rgba(255,107,26,0.2)' : 'none',
                      }}
                    >
                      <div
                        className="text-xl font-bold mb-0.5"
                        style={{ color: form.language === lang.code ? '#FF6B1A' : 'white' }}
                      >
                        {lang.label}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {lang.sub !== lang.label ? lang.sub : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="mb-7">
                <label className="form-label text-base mb-3">Communication Tone *</label>
                <div className="space-y-3">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('tone', t.value)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: form.tone === t.value ? 'rgba(255,107,26,0.12)' : 'rgba(255,255,255,0.03)',
                        border: form.tone === t.value
                          ? '1px solid rgba(255,107,26,0.5)'
                          : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <div
                          className="font-semibold text-sm"
                          style={{ color: form.tone === t.value ? '#FF6B1A' : 'white' }}
                        >
                          {t.value}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">{t.desc}</div>
                      </div>
                      {form.tone === t.value && (
                        <div className="ml-auto">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: '#FF6B1A' }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Festival toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-xl mb-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div>
                  <div className="font-semibold text-sm text-white">🪔 Include Festival Greetings</div>
                  <div className="text-xs text-white/40 mt-0.5">Diwali, Eid, Christmas, Pongal &amp; more</div>
                </div>
                <button
                  type="button"
                  onClick={() => set('festivals', !form.festivals)}
                  className="relative w-12 h-6 rounded-full transition-all duration-200"
                  style={{ background: form.festivals ? '#FF6B1A' : 'rgba(255,255,255,0.15)' }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                    style={{ left: form.festivals ? '26px' : '4px' }}
                  />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1 py-4 rounded-xl font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary flex-[2] py-4 rounded-xl font-bold text-base"
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleGenerate} className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Review &amp; Generate
              </h2>

              <div
                className="rounded-xl p-5 mb-6 space-y-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { label: 'Business Name', value: form.businessName },
                  { label: 'Type', value: form.businessType },
                  { label: 'What you sell', value: form.description },
                  { label: 'Location', value: form.location },
                  { label: 'WhatsApp', value: form.whatsapp || 'Not provided' },
                  { label: 'Language', value: form.language },
                  { label: 'Tone', value: form.tone },
                  { label: 'Festival greetings', value: form.festivals ? 'Yes ✓' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs text-white/40 sm:w-40 flex-shrink-0">{label}</span>
                    <span className="text-sm text-white/80 font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div
                className="flex items-start gap-3 p-4 rounded-xl mb-6"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <span className="text-lg">✨</span>
                <div className="text-sm text-white/60">
                  You&apos;ll get <strong className="text-white/90">3 WhatsApp messages, 3 Instagram captions, 2 Facebook posts, a Google Business description, and a flyer</strong> — all in <strong className="text-white/90">{form.language}</strong>.
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 p-4 rounded-xl mb-4"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <span>⚠️</span>
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-ghost flex-1 py-4 rounded-xl font-semibold"
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-[2] py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      AI is writing your promotions... 🤖
                    </>
                  ) : (
                    'Generate My PromoKit →'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {['🔒 No account needed', '⚡ Results in 10 seconds', '🆓 Free to start'].map((t) => (
            <span key={t} className="text-xs text-white/30">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

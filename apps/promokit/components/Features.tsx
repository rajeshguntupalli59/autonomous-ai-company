const features = [
  {
    icon: '🌐',
    title: '7 Indian Languages',
    description: 'Write in Hindi, Telugu, Tamil, Marathi, Kannada, Bengali, and English — in the actual script.',
    color: '#6366F1',
  },
  {
    icon: '💬',
    title: 'WhatsApp-Ready Messages',
    description: 'Copy-paste messages that feel personal, local, and drive customers to act.',
    color: '#22C55E',
  },
  {
    icon: '🪔',
    title: 'Festival Offers',
    description: 'Diwali, Eid, Christmas, Pongal, Navratri — auto-generate seasonal promotions.',
    color: '#FF6B1A',
  },
  {
    icon: '📄',
    title: 'Downloadable Flyers',
    description: 'Beautiful print-ready flyers with your business name, offers, and contact info.',
    color: '#EC4899',
  },
  {
    icon: '📱',
    title: 'QR Profile Page',
    description: 'A shareable mobile page for your business — like a digital visiting card with QR code.',
    color: '#14B8A6',
  },
  {
    icon: '🔍',
    title: 'Google Business Description',
    description: 'SEO-optimised Google Business description to help local customers find you online.',
    color: '#F59E0B',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 relative" style={{ background: '#050508' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(255,107,26,0.12)', border: '1px solid rgba(255,107,26,0.3)', color: '#FF6B1A' }}
          >
            Everything You Need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Your complete{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              marketing kit
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Everything a marketing agency charges ₹20,000/month for — powered by AI, available instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-hover rounded-2xl p-6 group"
              style={{
                background: '#141424',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>

              <div
                className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: f.color }}
              >
                Included in PromoKit
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

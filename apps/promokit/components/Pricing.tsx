const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tagline: 'Perfect to try it out',
    color: '#6366F1',
    popular: false,
    features: [
      '3 PromoKit generations / month',
      '2 languages (Hindi + English)',
      'WhatsApp messages',
      'Instagram captions',
      'Basic text flyer',
      'No credit card needed',
    ],
    cta: 'Start Free →',
    ctaHref: '/create',
  },
  {
    name: 'Starter',
    price: '₹299',
    period: '/month',
    tagline: 'For active small businesses',
    color: '#FF6B1A',
    popular: true,
    features: [
      'Unlimited generations',
      'All 7 Indian languages',
      'WhatsApp + Instagram + Facebook',
      'Google Business description',
      'Festival offer templates (20+)',
      'Downloadable PDF flyers',
      'QR digital profile page',
      'Priority support',
    ],
    cta: 'Get Starter →',
    ctaHref: '/create',
  },
  {
    name: 'Growth',
    price: '₹699',
    period: '/month',
    tagline: 'For serious business growth',
    color: '#22C55E',
    popular: false,
    features: [
      'Everything in Starter',
      '5 business profiles',
      'Scheduled WhatsApp broadcasts',
      'Customer response templates',
      'Monthly marketing calendar',
      'Analytics & reach tracking',
      'Branded flyer with logo',
      'Dedicated account manager',
    ],
    cta: 'Get Growth →',
    ctaHref: '/create',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden" style={{ background: '#0F0F1A' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,26,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
          >
            Simple Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Transparent.{' '}
            <span style={{ background: 'linear-gradient(135deg, #22C55E, #4ADE80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Affordable.
            </span>{' '}
            No surprises.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Less than a cup of chai per day. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-7 card-hover ${plan.popular ? '' : ''}`}
              style={
                plan.popular
                  ? {
                      background: 'linear-gradient(145deg, #1a1128, #1a1020)',
                      border: '1px solid rgba(255,107,26,0.4)',
                      boxShadow: '0 0 40px rgba(255,107,26,0.15)',
                    }
                  : {
                      background: '#141424',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="popular-badge">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm pb-1">{plan.period}</span>
                </div>
                <p className="text-white/40 text-sm">{plan.tagline}</p>
              </div>

              <div
                className="h-px mb-6"
                style={{ background: `linear-gradient(90deg, ${plan.color}30, transparent)` }}
              />

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/70">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: plan.color }}
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`block text-center w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200`}
                style={
                  plan.popular
                    ? {
                        background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)',
                        color: 'white',
                        boxShadow: '0 0 30px rgba(255,107,26,0.4)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.06)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }
                }
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          All prices in Indian Rupees (INR) · GST applicable · Cancel anytime
        </p>
      </div>
    </section>
  );
}

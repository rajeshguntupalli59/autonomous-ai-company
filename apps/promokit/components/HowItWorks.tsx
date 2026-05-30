export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '📝',
      title: 'Enter Details',
      description: 'Tell us your business name, what you sell, and your location. Takes 60 seconds.',
      color: '#FF6B1A',
    },
    {
      number: '02',
      icon: '🌐',
      title: 'Pick Language',
      description: 'Choose from Hindi, Telugu, Tamil, Marathi, Kannada, Bengali, or English.',
      color: '#6366F1',
    },
    {
      number: '03',
      icon: '🤖',
      title: 'AI Generates',
      description: 'Our AI writes WhatsApp messages, Instagram captions, and flyers — instantly.',
      color: '#22C55E',
    },
    {
      number: '04',
      icon: '🚀',
      title: 'Share & Grow',
      description: 'Copy, download, and share. Watch customers walk through your door.',
      color: '#FF6B1A',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden" style={{ background: '#0F0F1A' }}>
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366F1' }}
          >
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            4 steps.{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              2 minutes.
            </span>{' '}
            Done.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            No technical knowledge needed. No design software. Just your phone and 2 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-10 z-10"
                  style={{
                    left: 'calc(50% + 48px)',
                    right: 'calc(-50% + 16px)',
                    height: '2px',
                    borderTop: '2px dashed rgba(255,107,26,0.25)',
                  }}
                />
              )}

              <div
                className="gradient-border card-hover h-full"
                style={{ cursor: 'default' }}
              >
                <div className="p-6 h-full flex flex-col items-center text-center lg:items-start lg:text-left">
                  {/* Number + Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                    >
                      {step.icon}
                    </div>
                    <span
                      className="text-4xl font-black"
                      style={{ color: `${step.color}25` }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <a
            href="/create"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl"
          >
            Try It Now — Free →
          </a>
          <p className="text-white/30 text-sm mt-3">No credit card. No signup email. Just results.</p>
        </div>
      </div>
    </section>
  );
}

import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import LivePreview from '@/components/LivePreview';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <LivePreview />
        <Features />
        <Pricing />

        {/* CTA Banner */}
        <section className="py-20 px-4 sm:px-6" style={{ background: '#0F0F1A' }}>
          <div
            className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1a0a00, #0d0818)',
              border: '1px solid rgba(255,107,26,0.25)',
            }}
          >
            {/* Orbs */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,107,26,0.12) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />

            <div className="relative z-10">
              <div className="text-4xl mb-4">🇮🇳</div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
                63 million small businesses in India.<br />
                None of them have a marketing team.{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #FF6B1A, #FF8C42)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  You do now.
                </span>
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of kirana stores, salons, restaurants, and boutiques already using PromoKit to grow their customer base.
              </p>
              <Link
                href="/create"
                className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-lg font-bold rounded-2xl"
              >
                Start Free — No Credit Card Needed →
              </Link>
              <p className="text-white/30 text-sm mt-4">Setup in 2 minutes · No technical skills · Works on any phone</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

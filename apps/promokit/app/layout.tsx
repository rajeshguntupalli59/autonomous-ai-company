import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromoKit — AI Marketing for Indian Small Businesses',
  description: 'AI writes your WhatsApp messages, Instagram posts & flyers in Hindi, Telugu, Tamil and more. No design skills needed.',
  keywords: 'Indian business marketing, WhatsApp marketing, Hindi promotion, small business India',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain-overlay bg-base text-white antialiased">
        {children}
      </body>
    </html>
  );
}

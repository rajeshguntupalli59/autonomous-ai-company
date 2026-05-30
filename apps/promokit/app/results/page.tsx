import Nav from '@/components/Nav';
import ResultsDashboard from '@/components/ResultsDashboard';

export const metadata = {
  title: 'Your PromoKit Results — AI Generated Promotions',
  description: 'Your AI-generated WhatsApp messages, Instagram captions, flyers and more are ready.',
};

export default function ResultsPage() {
  return (
    <>
      <Nav />
      <ResultsDashboard />
    </>
  );
}

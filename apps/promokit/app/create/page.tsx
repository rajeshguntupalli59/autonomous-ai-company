import Nav from '@/components/Nav';
import BusinessForm from '@/components/BusinessForm';

export const metadata = {
  title: 'Create PromoKit — AI Marketing for Your Business',
  description: 'Fill in your business details and get AI-written WhatsApp messages, Instagram posts, and more in your language.',
};

export default function CreatePage() {
  return (
    <>
      <Nav />
      <BusinessForm />
    </>
  );
}

import type { Metadata } from 'next';
import { BranchCards } from '@/components/contact/BranchCards';
import { ContactForm } from '@/components/contact/ContactForm';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { Reveal } from '@/components/ui/Reveal';
import { contactPage } from '@/content/contact';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: contactPage.description,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <div className="pt-24 sm:pt-28">
        <TickerStrip />
      </div>

      <section aria-labelledby="contact-heading" className="pb-16 pt-20 sm:pb-20 sm:pt-24">
        <div className="shell">
          {/* CSS entrance, not Framer Motion: this is the page's LCP element. */}
          <h1 id="contact-heading" className="page-title animate-fade-up text-center">
            {contactPage.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <Reveal delay={0.12} className="mt-16 sm:mt-20">
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <BranchCards />
    </>
  );
}

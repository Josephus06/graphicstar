import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import {
  branches,
  mapsHref,
  navLinks,
  primaryContact,
  site,
  socialLinks,
  telHref,
} from '@/content/site';

function SocialIcon({ name }: { name: 'facebook' | 'instagram' }) {
  if (name === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.98c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.18.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.18.22.55.47.94.88 1.35.41.41.8.66 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.18-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.75-.07Zm0 3.37a4.49 4.49 0 1 1 0 8.98 4.49 4.49 0 0 1 0-8.98Zm0 7.4a2.91 2.91 0 1 0 0-5.82 2.91 2.91 0 0 0 0 5.82Zm5.72-7.6a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0Z" />
    </svg>
  );
}

export function Footer() {
  const main = primaryContact.branch;

  return (
    <footer className="border-t border-grey-line bg-white">
      <div className="shell grid gap-12 py-16 sm:grid-cols-2 sm:py-20 md:grid-cols-[1.2fr_1fr_1.4fr] md:gap-16">
        {/* Brand */}
        <div>
          <Logo height={48} />
          <p className="mt-5 max-w-xs text-[15px] leading-[1.7] text-ink/70">{site.description}</p>
          <ul className="mt-6 flex items-center gap-3">
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-grey-line text-ink transition-colors duration-150 hover:border-blue hover:bg-blue hover:text-white"
                >
                  <span className="sr-only">{`${site.name} on ${social.label}`}</span>
                  <SocialIcon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Nav */}
        <nav aria-label="Footer">
          <h2 className="eyebrow">Explore</h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-[15px] font-medium text-ink transition-colors duration-150 hover:text-blue"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="eyebrow">Get in touch</h2>
          <address className="mt-5 space-y-3 text-[15px] not-italic leading-[1.7] text-ink/80">
            <p className="font-semibold text-ink">{main.name}</p>
            <p>{main.address}</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <a href={telHref(main.landline)} className="rounded-sm hover:text-blue">
                {main.landline}
              </a>
              <a href={telHref(main.mobile)} className="rounded-sm hover:text-blue">
                {main.mobile}
              </a>
            </p>
            <p>
              <a href={`mailto:${primaryContact.email}`} className="rounded-sm hover:text-blue">
                {primaryContact.email}
              </a>
            </p>
          </address>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink/60">
            {branches.map((branch) => (
              <li key={branch.slug}>
                <a
                  href={mapsHref(branch.mapQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm underline decoration-grey-line underline-offset-4 hover:text-blue"
                >
                  {branch.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-grey-line">
        <div className="shell flex flex-col gap-2 py-6 text-[13px] text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>Established {site.established} · Cebu, Philippines</p>
        </div>
      </div>
    </footer>
  );
}

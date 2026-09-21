import Link from "next/link";
import Image from "next/image";
import { img } from "@/lib/imageUrl";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import {
  siteConfig,
  footerOrgLinks,
  footerMoreLinks,
  footerInvolveLinks,
  footerLegalLinks,
  type FooterLink,
} from "@/data/site";

// Planned-route indicator is dev-only; production renders links normally.
const isDev = process.env.NODE_ENV === "development";

/** One footer nav entry: label, link and the dev-only "planned" marker. */
function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      <Link
        href={link.href}
        className="text-sm text-white/60 transition-colors hover:text-accent-bright"
      >
        {link.label}
        {isDev && link.status === "planned" && (
          <span
            className="ml-1.5 align-middle text-[9px] uppercase tracking-wide text-white/25"
            title="Planned — route ships in a later phase"
          >
            •soon
          </span>
        )}
      </Link>
    </li>
  );
}

const socialLinks = [
  { label: "Facebook", href: siteConfig.social.facebook, path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { label: "Instagram", href: siteConfig.social.instagram, path: "M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7.5a1 1 0 110-2 1 1 0 010 2z" },
  { label: "X (Twitter)", href: siteConfig.social.twitter, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" },
  { label: "YouTube", href: siteConfig.social.youtube, path: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" },
  { label: "TikTok", href: siteConfig.social.tiktok, path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" },
];

export default function Footer() {
  return (
    <footer className="relative bg-primary text-text-on-primary overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
                It takes all of us.
              </h3>
              <p className="mt-2 text-lg text-white/60">
                Give, volunteer or partner — every route helps a child move from disadvantage to opportunity.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/give"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <Heart className="h-4 w-4" />
                Give Now
              </Link>
              <Link
                href="/get-involved/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02]"
              >
                Volunteer
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02]"
              >
                Partner With FTF
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-auto overflow-hidden">
                <Image
                  src={img("/images/misc/ftf-logo-white.png")}
                  alt="FTF"
                  width={2559}
                  height={964}
                  className="h-12 w-auto object-contain"
                  unoptimized
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/50 mb-6">
              {siteConfig.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-all hover:bg-accent/20 hover:text-accent-bright"
                  aria-label={social.label}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Organization Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              Organization
            </h4>
            <ul className="space-y-3">
              {footerOrgLinks.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
            </ul>
          </div>

          {/* More Pages */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              More
            </h4>
            <ul className="space-y-3">
              {[...footerMoreLinks, ...footerLegalLinks].map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              Get Involved
            </h4>
            <ul className="space-y-3">
              {footerInvolveLinks.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-accent-bright/70 shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.emails[0]}`}
                  className="text-sm text-white/60 hover:text-accent-bright transition-colors"
                >
                  {siteConfig.contact.emails[0]}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-accent-bright/70 shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phones[0]}`}
                  className="text-sm text-white/60 hover:text-accent-bright transition-colors"
                >
                  {siteConfig.contact.phones[0]}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-accent-bright/70 shrink-0" />
                <span className="text-sm text-white/60">
                  Ghana · Nigeria · United States
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved. {siteConfig.legal.status}.
            </p>
            <div className="flex flex-col items-center gap-1 md:items-end">
              <p className="text-xs text-white/30">
                {siteConfig.legal.taxNote}
              </p>
              <p className="text-xs text-white/25">
                Powered by{" "}
                <a
                  href="https://arthiumlabs.live/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 underline decoration-white/20 underline-offset-2 transition-colors hover:text-accent-bright hover:decoration-accent/40"
                >
                  Arthium Labs
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

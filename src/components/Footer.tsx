'use client';

import Link from 'next/link';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  disabled?: boolean;
}

function FooterLink({ href, children, external = false, disabled = false }: FooterLinkProps) {
  if (disabled) {
    return (
      <span className="block text-[0.78rem] text-zinc-700 cursor-default select-none">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="block text-[0.78rem] text-zinc-500 no-underline footer-link focus-visible:outline-none"
    >
      {children}
      {external && (
        <span aria-hidden="true" className="ml-0.5 text-[0.65rem] text-zinc-600">↗</span>
      )}
    </a>
  );
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.62rem] font-bold tracking-[0.12em] uppercase mb-3.5 text-zinc-700 select-none">
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer
      className="relative z-10"
      style={{ background: 'linear-gradient(to bottom, transparent, var(--color-surface-1))' }}
    >
      {/* Copper rule */}
      <div
        aria-hidden="true"
        className="h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(205,127,50,0.35) 30%, rgba(205,127,50,0.35) 70%, transparent)' }}
      />

      <div className="page-container pt-10 sm:pt-12">

        {/* Grid: brand + 3 link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <Link
              href="/busbar-calculator"
              className="flex items-center gap-2 w-fit transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
            >
              <span className="text-sm font-black tracking-tight text-shimmer">Busbar Calculator</span>
              <span
                className="text-[0.55rem] font-bold tracking-widest text-zinc-600 rounded px-1.5 py-0.5"
                style={{ border: '1px solid var(--color-surface-4)' }}
              >
                PRO
              </span>
            </Link>
            <p className="text-[0.75rem] leading-relaxed text-zinc-600 max-w-[16rem]">
              Industrial Tools for Electrical Panel Fabricators
            </p>
            <p className="text-[0.68rem] text-zinc-700">
              A Busbar Calculator initiative
            </p>
          </div>

          {/* Product column */}
          <div>
            <ColHeading>Product</ColHeading>
            <nav className="space-y-2.5" aria-label="Product">
              <FooterLink href="/busbar-calculator">Calculator</FooterLink>
              <FooterLink href="/roadmap">Roadmap</FooterLink>
              <FooterLink href="#" disabled>Coming Soon</FooterLink>
            </nav>
          </div>

          {/* Resources column */}
          <div>
            <ColHeading>Resources</ColHeading>
            <nav className="space-y-2.5" aria-label="Resources">
              <FooterLink href="/whitepaper">Whitepaper</FooterLink>
              <FooterLink
                href="https://github.com/PAYAPRESS-prog/payapresswebapp/blob/main/docs/API.md"
                external
              >
                API Reference
              </FooterLink>
              <FooterLink
                href="https://github.com/PAYAPRESS-prog/payapresswebapp/blob/main/docs/architecture.md"
                external
              >
                Architecture
              </FooterLink>
              <FooterLink href="https://github.com/PAYAPRESS-prog/payapresswebapp" external>
                GitHub
              </FooterLink>
            </nav>
          </div>

          {/* Company column */}
          <div>
            <ColHeading>Company</ColHeading>
            <nav className="space-y-2.5" aria-label="Company">
              <FooterLink href="https://www.payapress.com" external>payapress.com</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink
                href="https://github.com/PAYAPRESS-prog/payapresswebapp/blob/main/SECURITY.md"
                external
              >
                Security
              </FooterLink>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="copper-divider mt-10 mb-0" aria-hidden="true" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-4 text-zinc-700">
          <p className="text-[0.68rem]">© 2025 Busbar Calculator</p>
          <p className="text-[0.68rem] sm:text-right">
            Prices from COMEX HG=F · For reference only · v1.0.0
          </p>
        </div>

        <p className="text-center text-[0.63rem] mt-3 pb-safe text-zinc-800">
          Built with ♥ by Busbar Calculator Team
        </p>
      </div>
    </footer>
  );
}

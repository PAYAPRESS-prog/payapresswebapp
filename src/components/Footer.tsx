'use client';

import { motion } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  disabled?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FooterLink({ href, children, external = false, disabled = false }: FooterLinkProps) {
  if (disabled) {
    return (
      <span className="block text-[0.78rem] text-zinc-700 cursor-default select-none">
        {children}
      </span>
    );
  }
  return (
    <motion.a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="block text-[0.78rem] focus-visible:outline-none"
      style={{ color: '#71717a', textDecoration: 'none' }}
      whileHover={{ x: 3, color: '#cd7f32' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {children}
      {external && (
        <span
          aria-hidden="true"
          style={{ marginLeft: '0.2rem', fontSize: '0.65rem', color: '#52525b' }}
        >
          ↗
        </span>
      )}
    </motion.a>
  );
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.62rem] font-bold tracking-[0.12em] uppercase mb-3.5 select-none"
      style={{ color: '#3f3f46' }}
    >
      {children}
    </p>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(to bottom, transparent, var(--color-surface-1))',
      }}
      className="relative z-10"
    >
      {/* Copper top-fade accent line */}
      <div
        aria-hidden="true"
        style={{
          height: '1px',
          background:
            'linear-gradient(to right, transparent, rgba(205,127,50,0.35) 30%, rgba(205,127,50,0.35) 70%, transparent)',
        }}
      />

      <div
        className="w-full max-w-2xl lg:max-w-[92vw] 2xl:max-w-[1440px] mx-auto
                   px-4 sm:px-6 lg:px-8
                   pt-10 sm:pt-12"
      >
        {/* ── Main grid ──────────────────────────────────────────────────── */}
        {/*
          Mobile   (<640px) : brand full-width, then 3-col link row
          Tablet  (640-767px): same 3-col but wider gaps
          Desktop (768px+)  : 5-col grid, brand 2 cols + 3 link cols
        */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-8 md:gap-8">

          {/* Brand column — spans full width on mobile, 2 cols on md+ */}
          <div className="col-span-3 md:col-span-2 space-y-3">
            <motion.a
              href="/"
              className="flex items-center gap-2 w-fit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-base font-black tracking-tight text-shimmer">PAYAPRESS</span>
              <span
                className="text-[0.55rem] font-bold tracking-widest rounded px-1.5 py-0.5"
                style={{ color: '#52525b', border: '1px solid var(--color-surface-4)' }}
              >
                PRO
              </span>
            </motion.a>

            <p className="text-[0.78rem] leading-snug max-w-[18rem]" style={{ color: '#52525b' }}>
              Industrial Tools for Electrical Panel Fabricators
            </p>

            <p className="text-[0.68rem]" style={{ color: '#3f3f46' }}>
              A PAYAP MACHINERY initiative
            </p>
          </div>

          {/* PRODUCT column — each link col is 1 of 3 on mobile, 1 of 5 on md */}
          <div className="col-span-1">
            <ColHeading>Product</ColHeading>
            <nav className="space-y-2.5" aria-label="Product">
              <FooterLink href="/">Calculator</FooterLink>
              <FooterLink href="/roadmap">Roadmap</FooterLink>
              <FooterLink href="#" disabled>Coming Soon</FooterLink>
            </nav>
          </div>

          {/* RESOURCES column */}
          <div className="col-span-1">
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
              <FooterLink
                href="https://github.com/PAYAPRESS-prog/payapresswebapp"
                external
              >
                GitHub
              </FooterLink>
            </nav>
          </div>

          {/* COMPANY column */}
          <div className="col-span-1">
            <ColHeading>Company</ColHeading>
            <nav className="space-y-2.5" aria-label="Company">
              <FooterLink href="https://www.payapress.com" external>
                payapress.com
              </FooterLink>
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

        {/* ── Copper divider ─────────────────────────────────────────────── */}
        <div className="copper-divider mt-10 mb-0" aria-hidden="true" />

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between
                     gap-1 sm:gap-0 pt-5"
          style={{ color: '#3f3f46' }}
        >
          <p className="text-[0.68rem]">
            © 2025 PAYAP MACHINERY · Trading as PAYAPRESS
          </p>
          <p className="text-[0.68rem] sm:text-right">
            Prices from COMEX HG=F · For reference only · v1.0.0
          </p>
        </div>

        <p
          className="text-center text-[0.63rem] mt-3 pb-safe"
          style={{ color: '#27272f' }}
        >
          Built with ♥ by PAYAPRESS Digital Marketing Team
        </p>
      </div>
    </footer>
  );
}

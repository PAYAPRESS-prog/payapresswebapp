'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BusbarLogo, BellIcon } from './FxIcons';
import { FxNotifySheet } from './FxNotifySheet';

/* Premium app footer — designed in the product's Figma language:
   dark glass surface with a copper hairline, brand column with live
   metal chips, three link columns, a price-alerts CTA and an
   attribution bottom bar with Mr Busbar. Responsive: 5-col grid on
   desktop, stacked 2-col grid on mobile (below the app shell).

   SEO: each internal anchor text matches the target keyword of the
   page it links to (keep in sync with each page's metadata). */

const PRODUCT_LINKS: Array<[string, string]> = [
  ['Busbar Calculator', '/busbar-calculator'],
  ['Busbar Waste Calculator', '/busbar-waste-calculator'],
  ['Electrical Panel Busbar Cost Calculator', '/electrical-panel-busbar-cost-calculator'],
  ['Calculation History', '/app/history'],
  ['Product Roadmap', '/roadmap'],
  ['Busbar Calculator for Windows, Android & iOS', '/download'],
];

const RESOURCE_LINKS: Array<[string, string, boolean?]> = [
  ['Busbar Calculation Formulas — Whitepaper', '/whitepaper'],
  ['API Reference', 'https://github.com/PAYAPRESS-prog/payapresswebapp/blob/main/docs/API.md', true],
  ['GitHub', 'https://github.com/PAYAPRESS-prog/payapresswebapp', true],
];

const COMPANY_LINKS: Array<[string, string, boolean?]> = [
  ['payapress.com', 'https://www.payapress.com', true],
  ['Privacy Policy', '/privacy'],
  ['Terms', '/terms'],
];

function FooterCol({ title, links }: { title: string; links: Array<[string, string, boolean?]> }) {
  return (
    <nav className="fxf-col" aria-label={title}>
      <h3 className="fxf-col-title">{title}</h3>
      {title === 'Product' && (
        <button type="button" className="fxf-link fxf-link-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('bc:pulse:open'))}>
          Give feedback
        </button>
      )}
      {links.map(([label, href, external]) =>
        external ? (
          <a key={label} href={href} className="fxf-link" target="_blank" rel="noopener noreferrer">
            {label}<span className="fxf-ext" aria-hidden>↗</span>
          </a>
        ) : (
          <Link key={label} href={href} className="fxf-link">{label}</Link>
        ),
      )}
    </nav>
  );
}

export function FxFooter({
  copperPrice = null,
  aluminumPrice = null,
}: {
  copperPrice?: number | null;
  aluminumPrice?: number | null;
}) {
  const [notifyOpen, setNotifyOpen] = useState(false);

  return (
    <footer className="fxf" aria-label="Site footer">
      {/* copper hairline */}
      <div className="fxf-rule" aria-hidden />

      <div className="fxf-inner">
        {/* ── Brand column ── */}
        <div className="fxf-brand">
          <div className="fxf-brand-row">
            <BusbarLogo height={30} />
          </div>
          <p className="fxf-mission">
            Professional copper &amp; aluminum busbar sizing with live market
            pricing — weight, ampacity and cost in seconds.
          </p>
          {(copperPrice || aluminumPrice) && (
            <div className="fxf-prices">
              {copperPrice && (
                <span className="fxf-price"><i className="cu" />Cu ${copperPrice.toFixed(2)}<em>/kg</em></span>
              )}
              {aluminumPrice && (
                <span className="fxf-price"><i className="al" />Al ${aluminumPrice.toFixed(2)}<em>/kg</em></span>
              )}
              <span className="fxf-price-live">live</span>
            </div>
          )}
        </div>

        {/* ── Link columns ── */}
        <FooterCol title="Product" links={PRODUCT_LINKS} />
        <FooterCol title="Resources" links={RESOURCE_LINKS} />
        <FooterCol title="Company" links={COMPANY_LINKS} />

        {/* ── Alerts CTA ── */}
        <div className="fxf-cta">
          <h3 className="fxf-col-title">Stay ahead of the market</h3>
          <p className="fxf-cta-text">
            Get the daily copper &amp; aluminum price report with your saved
            configurations re-priced.
          </p>
          <button type="button" className="fxf-cta-btn" onClick={() => setNotifyOpen(true)}>
            <BellIcon width={17} height={17} />
            Enable price alerts
          </button>
          <Link href="/download" className="fxf-win-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3 5.5 10.5 4.4v7.1H3V5.5Zm0 13 7.5 1.1v-7H3v5.9ZM11.5 4.2 21 3v8.5h-9.5V4.2Zm0 15.6L21 21v-8.5h-9.5v7.3Z"/>
            </svg>
            Get the app — Windows · Android · iOS
          </Link>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="fxf-bottom">
        <span>© 2026 Busbar Calculator · All rights reserved</span>
        <span className="fxf-bottom-note">
          Prices from COMEX HG=F &amp; LME · For reference only
        </span>
        <span className="fxf-built">
          Built with <em aria-hidden>♥</em> by the Busbar team
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mr-busbar.png" alt="" width={16} height={46} loading="lazy" />
        </span>
      </div>

      <FxNotifySheet open={notifyOpen} onClose={() => setNotifyOpen(false)} />
    </footer>
  );
}

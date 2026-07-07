'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BusbarLogo, BellIcon } from './FxIcons';
import { FxNotifySheet } from './FxNotifySheet';

/* Premium app footer — designed in the product's Figma language:
   dark glass surface with a copper hairline, brand column with live
   metal chips, three link columns, a price-alerts CTA and an
   attribution bottom bar with Mr Busbar. Desktop-only (the mobile
   view is an app shell with bottom navigation). */

const PRODUCT_LINKS: Array<[string, string]> = [
  ['Calculator', '/busbar-calculator'],
  ['History', '/app/history'],
  ['Waste Calculator', '/busbar-waste-calculator'],
  ['Panel Cost (EPLAN)', '/electrical-panel-busbar-cost-calculator'],
  ['Roadmap', '/roadmap'],
  ['Windows app', '/download'],
];

const RESOURCE_LINKS: Array<[string, string, boolean?]> = [
  ['Whitepaper', '/whitepaper'],
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

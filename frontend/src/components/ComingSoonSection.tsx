const UPCOMING = [
  {
    icon: '📊',
    title: 'Live Metal Prices',
    desc: 'Real-time prices for copper, aluminum, steel, and zinc from global exchanges.',
  },
  {
    icon: '📰',
    title: 'Industry News',
    desc: 'Latest news and updates from the electrical panel fabrication industry.',
  },
  {
    icon: '⚙️',
    title: 'Equipment Costs',
    desc: 'Calculate costs for cables, lugs, enclosures, and other panel components.',
  },
  {
    icon: '💱',
    title: 'Multi-Currency',
    desc: 'Display results in USD, EUR, GBP, or any local currency with live FX rates.',
  },
  {
    icon: '📐',
    title: 'Project Estimator',
    desc: 'Full project bill-of-materials costing with exportable reports.',
  },
  {
    icon: '🔧',
    title: 'Custom Profiles',
    desc: 'Enter any custom busbar dimensions outside standard IEC/DIN sizes.',
  },
] as const;

export function ComingSoonSection() {
  return (
    <section className="mt-16 mb-12">
      <div className="copper-divider mb-8">Coming Soon</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UPCOMING.map(item => (
          <div key={item.title} className="soon-card">
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-sm text-zinc-200 mb-1">{item.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

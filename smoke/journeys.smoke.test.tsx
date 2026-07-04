/**
 * User-journey tests — walk the app the way a real user does, across
 * multiple paths: first visit, calculate, currency switch, metal switch,
 * chart interaction (pin), compare deltas, auth errors, forgot-password,
 * history rendering + failed delete. Catches technical AND flow bugs.
 */
import { render, screen, fireEvent, act, within, cleanup } from '@testing-library/react';
import { FxCalculator } from '@/components/figma/FxCalculator';
import { FxWelcome } from '@/components/figma/FxWelcome';
import { FxHistoryPage } from '@/components/figma/FxHistoryPage';

beforeAll(() => {
  window.matchMedia = window.matchMedia || ((q: string) => ({
    matches: false, media: q, onchange: null,
    addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  } as unknown as MediaQueryList));
  global.ResizeObserver = global.ResizeObserver || class {
    observe() {} unobserve() {} disconnect() {}
  };
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || jest.fn();
  // Chart pointer math needs a real bounding box (jsdom returns zeros)
  Object.defineProperty(SVGElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ width: 340, height: 185, left: 0, top: 0, right: 340, bottom: 185, x: 0, y: 0, toJSON: () => ({}) }),
  });
  global.fetch = jest.fn() as unknown as typeof fetch;
});

const now = Math.floor(1_780_000_000);
const HISTORY_POINTS = {
  timestamps:  Array.from({ length: 30 }, (_, i) => now - (29 - i) * 86400),
  pricesPerKg: Array.from({ length: 30 }, (_, i) => 9 + Math.sin(i / 4)),
};

const json = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body } as Response);

const baseFetch = async (url: RequestInfo | URL) => {
  const u = String(url);
  if (u.includes('auth/me'))       return json({ user: null });
  if (u.includes('price-history')) return json(HISTORY_POINTS);
  if (u.includes('copper'))        return json({ pricePerKg: 9.5, updatedAt: new Date().toISOString(), source: 'test' });
  if (u.includes('aluminum'))      return json({ pricePerKg: 2.4, updatedAt: new Date().toISOString(), source: 'test' });
  if (u.includes('fx'))            return json({ EUR: 0.9, GBP: 0.78, isFallback: false, source: 'test', updatedAt: new Date().toISOString() });
  return json({});
};

beforeEach(() => { (global.fetch as jest.Mock).mockImplementation(baseFetch); });
afterEach(() => {
  cleanup();
  expect(document.body.style.overflow === '' || document.body.style.overflow === 'visible').toBe(true);
});

async function calculate() {
  await act(async () => { render(<FxCalculator />); });
  const inputs = document.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"]');
  fireEvent.change(inputs[0], { target: { value: '1000' } }); // length
  fireEvent.change(inputs[1], { target: { value: '100' } });  // width
  fireEvent.change(inputs[2], { target: { value: '10' } });   // thickness
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /calculate/i })); });
}

describe('Journey: first visit (welcome page)', () => {
  it('renders hero, Start Calculate links to /app, Sign Up opens auth sheet', async () => {
    await act(async () => { render(<FxWelcome />); });
    expect(screen.getByText(/BusBar price Calculator/i)).toBeTruthy();
    // Figma flow: Start Calculate goes straight to the calculator
    const start = screen.getByRole('link', { name: /start calculate/i });
    expect(start.getAttribute('href')).toBe('/busbar-calculator');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /sign up/i })); });
    const dialog = await screen.findByRole('dialog', { name: /sign up/i });
    expect(dialog.parentElement).toBe(document.body);

    // Signup validation: mismatched passwords stay client-side
    const inputs = dialog.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: 'a@b.com' } });
    fireEvent.change(inputs[1], { target: { value: 'secret1' } });
    fireEvent.change(inputs[2], { target: { value: 'secret2' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: /^sign up$/i })); });
    expect(within(dialog).getByText(/do not match/i)).toBeTruthy();
    await act(async () => { fireEvent.click(dialog); }); // close via overlay
  });
});

describe('Journey: calculate → currency → metal switch', () => {
  it('shows results, switches currency to EUR, switches metal and grades', async () => {
    await calculate();
    expect(screen.getAllByText(/results/i).length).toBeGreaterThan(0);

    // Currency: pick EUR from the grid → active value uses fx rate
    const eurBtn = screen.getAllByRole('button').find(b => /EUR/.test(b.textContent ?? ''));
    expect(eurBtn).toBeTruthy();
    await act(async () => { fireEvent.click(eurBtn!); });
    expect(screen.getAllByText(/EUR/).length).toBeGreaterThan(0);

    // Metal switch: aluminum grades replace copper grades
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /aluminum/i })); });
    expect(screen.getAllByText(/aluminum/i).length).toBeGreaterThan(0);

    // Preset pill applies dimensions
    const preset = screen.getByRole('button', { name: '200x20' });
    await act(async () => { fireEvent.click(preset); });
    const inputs = document.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"]');
    expect(inputs[1].value).toBe('200');
    expect(inputs[2].value).toBe('20');
  });
});

describe('Journey: chart interaction (TradingView behaviors)', () => {
  it('click pins the crosshair; clicking same point unpins', async () => {
    await calculate();
    await act(async () => { await new Promise(r => setTimeout(r, 50)); }); // history fetch settles

    const svg = document.querySelector('.fx-busbar-chart-wrap svg');
    expect(svg).toBeTruthy();

    // Click mid-chart → crosshair + axis tags appear (price tag rect)
    await act(async () => { fireEvent.click(svg!, { clientX: 200 }); });
    let lines = svg!.querySelectorAll('line[stroke-dasharray="3,3"]');
    expect(lines.length).toBeGreaterThanOrEqual(2); // vertical + horizontal

    // Pinned: pointer leaving does NOT clear it
    await act(async () => { fireEvent.pointerLeave(svg!); });
    lines = svg!.querySelectorAll('line[stroke-dasharray="3,3"]');
    expect(lines.length).toBeGreaterThanOrEqual(2);

    // Clicking the same spot unpins and clears
    await act(async () => { fireEvent.click(svg!, { clientX: 200 }); });
    lines = svg!.querySelectorAll('line[stroke-dasharray="3,3"]');
    expect(lines.length).toBe(0);
  });
});

describe('Journey: compare configurations', () => {
  it('changing config B shows deltas and enables Share', async () => {
    // Compare is auth-gated — journey runs as a logged-in user
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('auth/me')) return json({ user: { id: 1, email: 't@p.com' } });
      return baseFetch(url);
    });
    await calculate();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /compare result/i })); });
    const dlg = await screen.findByRole('dialog', { name: /compare/i });

    const shareBtn = within(dlg).getByRole('button', { name: /share comparison/i });
    expect((shareBtn as HTMLButtonElement).disabled).toBe(true); // identical configs

    // Change B width → delta badges + share enabled
    const widthInput = within(dlg).getAllByRole('textbox')[0];
    fireEvent.change(widthInput, { target: { value: '200' } });
    fireEvent.blur(widthInput, { target: { value: '200' } });
    await act(async () => {});
    expect((within(dlg).getByRole('button', { name: /share comparison/i }) as HTMLButtonElement).disabled).toBe(false);

    const closeBtns = within(dlg).getAllByRole('button', { name: /^close$/i });
    await act(async () => { fireEvent.click(closeBtns[closeBtns.length - 1]); });
    await act(async () => { await new Promise(r => setTimeout(r, 400)); });
    expect(screen.queryByRole('dialog', { name: /compare/i })).toBeNull();
  });
});

describe('Journey: login failure paths', () => {
  it('surfaces the server 503 message and the forgot-password flow works', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes('auth/login'))  return json({ error: 'Login is not available yet. Database not configured.' }, 503);
      if (u.includes('auth/forgot')) return json({ ok: true });
      return baseFetch(url);
    });

    await act(async () => { render(<FxWelcome initialSheet="login" />); });
    const dlg = await screen.findByRole('dialog', { name: /log in/i });

    const inputs = dlg.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: 'user@x.com' } });
    fireEvent.change(inputs[1], { target: { value: 'secret1' } });
    await act(async () => { fireEvent.click(within(dlg).getByRole('button', { name: /^log in$/i })); });
    expect(within(dlg).getByText(/database not configured/i)).toBeTruthy();

    // Forgot-password: email → sent confirmation
    await act(async () => { fireEvent.click(within(dlg).getByRole('button', { name: /forgot password/i })); });
    expect(within(dlg).getByText(/reset your password/i)).toBeTruthy();
    await act(async () => { fireEvent.click(within(dlg).getByRole('button', { name: /send reset link/i })); });
    expect(within(dlg).getByText(/check your inbox/i)).toBeTruthy();
  });
});

describe('Journey: history list', () => {
  const items = [
    { id: 1, name: 'Panel A', metal: 'copper',   width: 100, thickness: 10, length: 1000, price: 1200, currency: 'USD', created_at: new Date().toISOString() },
    { id: 2, name: 'Panel B', metal: 'aluminum', width: 200, thickness: 20, length: 2000, price: 800,  currency: 'EUR', created_at: new Date().toISOString() },
  ];

  it('renders saved cards; a failed delete keeps the row', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.includes('/api/history')) {
        if (init?.method === 'DELETE') return json({ error: 'boom' }, 500);
        return json(items);
      }
      return baseFetch(url);
    });

    await act(async () => { render(<FxHistoryPage embedded copperPrice={9.5} aluminumPrice={2.4} />); });
    await act(async () => { await new Promise(r => setTimeout(r, 30)); });
    expect(screen.getByText('Panel A')).toBeTruthy();
    expect(screen.getByText('Panel B')).toBeTruthy();

    // Delete fails server-side → the card must NOT disappear
    const delBtn = screen.getAllByRole('button').find(b => /delete/i.test(b.getAttribute('aria-label') ?? ''));
    if (delBtn) {
      await act(async () => { fireEvent.click(delBtn); });
      await act(async () => { await new Promise(r => setTimeout(r, 30)); });
      expect(screen.getByText('Panel A')).toBeTruthy();
    }
  });

  it('logged-out (401) shows the sign-in state, not a crash', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('/api/history')) return json({ error: 'Unauthorized' }, 401);
      return baseFetch(url);
    });
    await act(async () => { render(<FxHistoryPage embedded copperPrice={9.5} aluminumPrice={2.4} />); });
    await act(async () => { await new Promise(r => setTimeout(r, 30)); });
    expect(document.body.textContent).toMatch(/sign in|log in/i);
  });
});

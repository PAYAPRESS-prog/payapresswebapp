/**
 * Smoke test — mounts the real FxCalculator in jsdom and walks the
 * critical user flow: type dimensions → Calculate → open/close the
 * Compare, Waste, Picker and Bookmark popups.
 *
 * Purpose: catch runtime crashes (the #1 cause of an app-wide
 * "no button works" failure) and stuck overlays that swallow clicks.
 */
import { render, screen, fireEvent, act, within, cleanup } from '@testing-library/react';
import { FxCalculator } from '@/components/figma/FxCalculator';

// ── Browser APIs missing from jsdom ─────────────────────────────
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

  global.fetch = jest.fn() as unknown as typeof fetch;
});

// Live price/FX fetches → deterministic fixtures (reset before every test
// so per-test overrides don't leak into the next one)
const baseFetchImpl = async (url: RequestInfo | URL) => {
  const u = String(url);
  const json = (body: unknown) => ({
    ok: true, status: 200,
    json: async () => body,
  } as Response);
  if (u.includes('auth/me'))  return json({ user: null });
  if (u.includes('price-history')) return json({ points: [] });
  if (u.includes('copper'))   return json({ pricePerKg: 9.5,  updatedAt: new Date().toISOString(), source: 'test' });
  if (u.includes('aluminum')) return json({ pricePerKg: 2.4,  updatedAt: new Date().toISOString(), source: 'test' });
  // Real /api/fx-rate shape is FLAT: rates at the top level, not under .rates
  if (u.includes('fx'))       return json({ EUR: 0.9, GBP: 0.78, TRY: 38, isFallback: false, source: 'test', updatedAt: new Date().toISOString() });
  return json({});
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockImplementation(baseFetchImpl);
});

afterEach(() => {
  // Unmount first — while a sheet is open, overflow:hidden is correct.
  // A lock that SURVIVES unmount is a real leak that freezes the app.
  cleanup();
  expect(document.body.style.overflow === '' || document.body.style.overflow === 'visible').toBe(true);
});

function typeDimensions() {
  const inputs = document.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"], input[inputmode="decimal"]');
  expect(inputs.length).toBeGreaterThanOrEqual(3);
  fireEvent.change(inputs[0], { target: { value: '100' } });
  fireEvent.change(inputs[1], { target: { value: '10' } });
  fireEvent.change(inputs[2], { target: { value: '1000' } });
}

async function mountAndCalculate() {
  await act(async () => {
    render(<FxCalculator initialData={{
      copper:   { pricePerKg: 9.5, updatedAt: new Date().toISOString(), source: 'test' },
      aluminum: { pricePerKg: 2.4, updatedAt: new Date().toISOString(), source: 'test' },
      fx:       { rates: { EUR: 0.9, GBP: 0.78 }, updatedAt: new Date().toISOString() },
    } as never} />);
  });
  typeDimensions();
  const calcBtn = screen.getByRole('button', { name: /calculate/i });
  await act(async () => { fireEvent.click(calcBtn); });
}

describe('FxCalculator critical flow (desktop)', () => {
  it('mounts without crashing and shows the calculator form', async () => {
    await act(async () => { render(<FxCalculator />); });
    expect(screen.getByRole('button', { name: /calculate/i })).toBeTruthy();
  });

  it('calculates and shows results', async () => {
    await mountAndCalculate();
    expect(screen.getAllByText(/results/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/weight/i).length).toBeGreaterThan(0);
  });

  it('opens the Compare sheet ABOVE everything and closes it cleanly', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('auth/me')) return { ok: true, status: 200, json: async () => ({ user: { id: 1, email: 't@p.com' } }) } as Response;
      return baseFetchImpl(url);
    });
    await mountAndCalculate();
    const compareBtn = screen.getByRole('button', { name: /compare result/i });
    await act(async () => { fireEvent.click(compareBtn); });

    const dialog = await screen.findByRole('dialog', { name: /compare configurations/i });
    expect(dialog).toBeTruthy();
    // Portaled to document.body — must NOT be inside the transformed app tree
    expect(dialog.parentElement).toBe(document.body);

    // Close via the new footer Close button (header also has an × — both must exist)
    const closeBtns = within(dialog).getAllByRole('button', { name: /^close$/i });
    expect(closeBtns.length).toBe(2); // header × + footer Close
    await act(async () => { fireEvent.click(closeBtns[closeBtns.length - 1]); });
    await act(async () => { await new Promise(r => setTimeout(r, 400)); });
    expect(screen.queryByRole('dialog', { name: /compare configurations/i })).toBeNull();
  });

  it('Waste button (logged out) opens the AUTH sheet above everything', async () => {
    await mountAndCalculate();
    const wasteBtn = screen.getByRole('button', { name: /waste calculation/i });
    await act(async () => { fireEvent.click(wasteBtn); });

    // Auth-gated: logged-out users get the login sheet, portaled to body
    const authDialog = await screen.findByRole('dialog', { name: /log in/i });
    expect(authDialog).toBeTruthy();
    expect(authDialog.parentElement).toBe(document.body);

    // Close by clicking the overlay backdrop
    await act(async () => { fireEvent.click(authDialog); });
    await act(async () => { await new Promise(r => setTimeout(r, 400)); });
    expect(screen.queryByRole('dialog', { name: /log in/i })).toBeNull();
  });

  it('Waste flow (logged in): name dialog → save → waste sheet opens and closes', async () => {
    // Pretend the user is logged in
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL) => {
      const u = String(url);
      const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body } as Response);
      if (u.includes('auth/me'))  return json({ user: { id: 1, email: 'test@payapress.com' } });
      if (u.includes('history'))  return json({ ok: true });
      if (u.includes('copper'))   return json({ pricePerKg: 9.5, updatedAt: new Date().toISOString(), source: 'test' });
      if (u.includes('aluminum')) return json({ pricePerKg: 2.4, updatedAt: new Date().toISOString(), source: 'test' });
      if (u.includes('fx'))       return json({ EUR: 0.9, isFallback: false, source: 'test', updatedAt: new Date().toISOString() });
      return json({});
    });

    await mountAndCalculate();
    const wasteBtn = screen.getByRole('button', { name: /waste calculation/i });
    await act(async () => { fireEvent.click(wasteBtn); });

    // Name dialog appears first (portaled)
    const nameDialog = await screen.findByRole('dialog', { name: /name your bookmark/i });
    expect(nameDialog.parentElement).toBe(document.body);
    const saveBtn = within(nameDialog).getByRole('button', { name: /^save$/i });
    await act(async () => { fireEvent.click(saveBtn); });
    await act(async () => { await new Promise(r => setTimeout(r, 100)); });

    // Then the waste sheet opens
    const wasteDialog = await screen.findByRole('dialog', { name: /waste calculation/i });
    expect(wasteDialog).toBeTruthy();

    const closeBtn = within(wasteDialog.parentElement as HTMLElement)
      .getAllByRole('button', { name: /^close$/i })[0];
    await act(async () => { fireEvent.click(closeBtn); });
    await act(async () => { await new Promise(r => setTimeout(r, 400)); });
    expect(screen.queryByRole('dialog', { name: /waste calculation/i })).toBeNull();
  });

  it('opens the currency picker (portaled) and selects a currency', async () => {
    await mountAndCalculate();
    const otherBtn = screen.getByRole('button', { name: /other/i });
    await act(async () => { fireEvent.click(otherBtn); });

    const dialog = await screen.findByRole('dialog', { name: /select currency/i });
    expect(dialog.parentElement).toBe(document.body);

    const search = within(dialog).getByPlaceholderText(/search/i);
    fireEvent.change(search, { target: { value: 'turkish' } });
    const row = within(dialog).getAllByRole('button')[0];
    await act(async () => { fireEvent.click(row); });
    expect(screen.queryByRole('dialog', { name: /select currency/i })).toBeNull();
  });

  it('SURVIVES the SW offline JSON during price polling (production dead-app bug)', async () => {
    // Simulate exactly what the Service Worker does when the network drops:
    // every /api/* call answers 503 {offline:true} — and price-history
    // answering 200 with a wrong shape must not crash the render either.
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('price-history')) {
        return { ok: true, status: 200, json: async () => ({ offline: true }) } as Response;
      }
      return {
        ok: false, status: 503,
        json: async () => ({ offline: true, error: 'No internet connection.' }),
      } as Response;
    });

    await act(async () => { render(<FxCalculator />); });
    typeDimensions();
    const calcBtn = screen.getByRole('button', { name: /calculate/i });
    await act(async () => { fireEvent.click(calcBtn); });

    // App must still be alive: results visible, buttons clickable.
    // Compare is auth-gated and auth/me is failing offline, so the tap
    // opens the login sheet — which proves the UI still responds.
    expect(screen.getAllByText(/results/i).length).toBeGreaterThan(0);
    const compareBtn = screen.getByRole('button', { name: /compare result/i });
    await act(async () => { fireEvent.click(compareBtn); });
    expect(await screen.findByRole('dialog', { name: /log in/i })).toBeTruthy();
  });

  it('leaves NO full-screen element that blocks clicks after closing everything', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('auth/me')) return { ok: true, status: 200, json: async () => ({ user: { id: 1, email: 't@p.com' } }) } as Response;
      return baseFetchImpl(url);
    });
    await mountAndCalculate();
    // Open + close compare
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /compare result/i })); });
    const dlg = await screen.findByRole('dialog', { name: /compare configurations/i });
    const dlgClose = within(dlg).getAllByRole('button', { name: /^close$/i });
    await act(async () => { fireEvent.click(dlgClose[dlgClose.length - 1]); });
    await act(async () => { await new Promise(r => setTimeout(r, 400)); });

    // No leftover overlay nodes parked on document.body
    const overlays = document.body.querySelectorAll(
      ':scope > .fx-cmp-overlay, :scope > .fx-waste-portal, :scope > .fx-picker-overlay, :scope > .fx-name-overlay, :scope > .fx-sheet-overlay',
    );
    expect(overlays.length).toBe(0);
    // Calculate button still reachable & clickable
    const calcBtn = screen.getByRole('button', { name: /calculate/i });
    await act(async () => { fireEvent.click(calcBtn); });
  });
});

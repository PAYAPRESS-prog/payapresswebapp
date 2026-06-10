// next/navigation stub — jsdom tests run outside a Next app router.
const router = {
  push: jest.fn(), replace: jest.fn(), back: jest.fn(),
  forward: jest.fn(), refresh: jest.fn(), prefetch: jest.fn(),
};
module.exports = {
  __esModule: true,
  useRouter: () => router,
  usePathname: () => '/busbar-calculator',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
};

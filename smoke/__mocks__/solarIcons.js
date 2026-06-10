// Stub for @solar-icons/react-perf/* in jsdom smoke tests.
// The real package is ESM-only (.mjs exports) which Jest's CJS resolver
// can't load; icons are purely visual so a no-op <svg> stands in.
const React = require('react');

module.exports = new Proxy({}, {
  get: (_t, name) => {
    if (name === '__esModule') return true;
    return function IconStub(props) {
      return React.createElement('svg', { 'data-icon': String(name), ...props });
    };
  },
});

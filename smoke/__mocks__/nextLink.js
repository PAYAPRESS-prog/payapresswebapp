// next/link stub — renders a plain anchor outside the Next router.
const React = require('react');
module.exports = {
  __esModule: true,
  default: function Link({ href, children, prefetch: _p, ...rest }) {
    return React.createElement('a', { href: typeof href === 'string' ? href : '#', ...rest }, children);
  },
};

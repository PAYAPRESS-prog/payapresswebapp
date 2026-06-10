// Shared, reference-counted body scroll lock.
//
// Multiple sheets can be open at once (results → name dialog → waste sheet).
// The naive save/restore-prev pattern breaks with overlapping lockers: the
// second locker saves prev='hidden' and whichever cleanup runs last leaves
// the body frozen forever. Counting locks makes the order irrelevant.

let locks = 0;

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  locks++;
  if (locks === 1) document.body.style.overflow = 'hidden';
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (locks > 0) locks--;
  if (locks === 0) document.body.style.overflow = '';
}

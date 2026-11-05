// Feature switches. The Warden fight is parked while the threat catalog is built out; its code stays in src/wardens/.
// Turn it on for testing with ?wardens=1 locally, or #wardens on the hosted page.
const loc = typeof location !== 'undefined' ? location : null;
const q = loc ? new URLSearchParams(loc.search) : null;
export const FEATURES = {
  wardens: !!(q && q.get('wardens') === '1') || !!(loc && /wardens/.test(loc.hash)),
};

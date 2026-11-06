// Feature switches. The Warden fight is parked while the threat catalog is built out; its code stays in src/wardens/.
// Turn it on for testing with ?wardens=1 locally, or #wardens on the hosted page.
const loc = typeof location !== 'undefined' ? location : null;
const q = loc ? new URLSearchParams(loc.search) : null;
export const FEATURES = {
  // only the sword for now; ?weapons=all (or #weapons) brings back the pick and the spear
  allWeapons: !!(q && q.get('weapons') === 'all') || !!(loc && /weapons/.test(loc.hash)),
  wardens: !!(q && q.get('wardens') === '1') || !!(loc && /wardens/.test(loc.hash)),
};

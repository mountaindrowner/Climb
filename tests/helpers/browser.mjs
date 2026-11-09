// The smallest browser the side view's motor needs, to run it in node: a few inert DOM pieces, storage, and a clock the
// test drives (input presses are timed by performance.now()).
const noop = () => {}, el = () => ({ style: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, addEventListener: noop, appendChild: noop, setAttribute: noop, querySelector: () => null, querySelectorAll: () => [], getContext: () => null, innerHTML: '', textContent: '', dataset: {} });
globalThis.window = globalThis;
globalThis.document = { getElementById: () => el(), querySelector: () => null, querySelectorAll: () => [], createElement: el, addEventListener: noop, body: el(), documentElement: el(), hidden: false };
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop }; globalThis.sessionStorage = globalThis.localStorage;
globalThis.matchMedia = () => ({ matches: false, addEventListener: noop }); globalThis.addEventListener = noop; globalThis.location = { search: '' };
try { Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [], maxTouchPoints: 0, userAgent: 'node' }, configurable: true }); } catch {}
globalThis.innerWidth = 1280; globalThis.innerHeight = 720; globalThis.requestAnimationFrame = noop;
export const clock = { t: 0 };
Object.defineProperty(globalThis, 'performance', { value: { now: () => clock.t * 1000 }, configurable: true, writable: true });

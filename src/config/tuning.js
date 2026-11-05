// Every feel number in one place. Times in seconds, distances in step units unless noted.
export const TUNE = {
  player: {
    hp: 5, flask: 3, flaskHeal: 2,
    jump: 0.5,        // airborne time
    jumpHeight: 0.95, // world units
    duck: 0.55,
    block: 0.4,
    parryWindow: 0.2, // press B within this of impact to parry
    invuln: 1.0,      // after taking a hit
    stumble: 0.4,     // slow after a missed gap
    grabCooldown: 0.45,
    rootHpFraction: 1 / 3, // health after catching a root
  },
  climb: {
    baseSpeed: 2.25,   // steps per second
    speedPerZone: 0.12,
    stumbleMul: 0.35,
    engagedMul: 0.25,  // while a crawler is duelling you
    brokenLiftMul: 0.4,
    thudAt: 0.42,      // fraction of a step at which the foot plants
    hintRange: 4,
    iconRange: 3.8,
  },
  crawler: {
    wake: 4.8, emerge: 3.2, emergeMax: 1.2, approach: 0.45,
    rear: 1.7, lunge: 0.5, stun: 0.7, engageRange: 2.4,
    hpFromZone: 2, // crawlers have 2 hp from this zone index on
  },
  spitter: {
    range: 3.7, charge: 0.6, flight: 0.62, reflect: 0.28,
  },
  gap: { crumble: 2.4 },                     // the step starts to fall away this many steps ahead
  beam: { creak: 3.2 },
  rockfall: { warn: 4.6, fall: 0.55, height: 9, hitRange: 0.7 },
  swing: { length: 4.2, angle: 1.15, period: 2.8 },   // released so the weight reaches the bottom as you arrive
  burrower: { wake: 5.4, lead: 4, jaws: 0.45, linger: 0.7 },
  flitter: { wake: 4.4, launch: 0.28, dive: 1.0, swat: 0.34 },
  warden: {
    hp: z => 12 + 5 * z,
    lead: 3.2,          // how far up the stair (step units) it strikes ahead of you
    hitRange: 2.2,      // how close (step units) you must be to the stuck arm or head to hit it
    fightSlowMul: 0.55, // the climb slows this much while it is winding up or exposed, so the tells read
    intro: 1.4,
    windup1: z => Math.max(0.75, 1.15 - 0.06 * z),
    windup2: z => Math.max(0.5, 0.78 - 0.04 * z),
    kneel1: 1.5, kneel2: 1.1, parryKneelBonus: 0.5,
    spitFlight: 0.5, reflect: 0.28, reflectDamage: 3,
    comboChance: 0.55, // phase 2 two-attack turns
    lateWarn: 0.42,    // phase 2 floor markers only flash this long before impact
    slamDamage: 2, sweepDamage: 1, spitDamage: 1,
    strike: 0.35, withdraw: 0.4, dying: 2.2,
  },
  fall: {
    slowmo: 0.3, grabWindow: 1.4, gravity: 34, startSpeed: 2,
    maxSpeed: y => Math.max(16, y / 2.3),
  },
  camera: {
    // climb camera: `back` is the camera's radius on the far side of the shaft centre (negative = opposite the warrior)
    climb: { back: -3.4, up: 3.2, look: 1.45, lead: 0.17 },
    fight: { back: -4.6, up: 3.7, look: 1.9, lead: 0.2 },   // during the Warden's stretch: out and up, so the wall and the breach are in frame
    fall:  { back: -4.2 },
    pool:  { back: -2, up: 4.5, look: 0 },
    title: { back: -2.6, up: 3.6, look: 1.4 },
    fovPortrait: 76, fovLandscape: 58,
    fogDensity: 0.05,
  },
  feel: {
    hitstopHurt: 0.08, hitstopHit: 0.05, hitstopKill: 0.09, hitstopParry: 0.12,
    shakeHurt: 0.45, stepDip: 0.14,
  },
};

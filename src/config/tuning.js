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
  warden: {
    hp: z => 12 + 5 * z,
    windup1: z => Math.max(0.75, 1.15 - 0.06 * z),
    windup2: z => Math.max(0.5, 0.78 - 0.04 * z),
    kneel1: 1.5, kneel2: 1.1, parryKneelBonus: 0.5,
    spitFlight: 0.5, reflect: 0.28, reflectDamage: 3,
    comboChance: 0.55, // phase 2 two-attack turns
    lateWarn: 0.42,    // phase 2 floor markers only flash this long before impact
    slamDamage: 2, sweepDamage: 1, spitDamage: 1,
    intro: 2, strike: 0.35, dying: 2.2,
  },
  fall: {
    slowmo: 0.3, grabWindow: 1.4, gravity: 34, startSpeed: 2,
    maxSpeed: y => Math.max(16, y / 2.3),
  },
  camera: {
    // climb camera: `back` is the camera's radius on the far side of the shaft centre (negative = opposite the warrior)
    climb: { back: -2.3, up: 2.9, look: 1.3, lead: 0.17 },
    boss:  { back: -5.2, up: 4.2, look: 2.6 },
    fall:  { back: -4.2 },
    pool:  { back: -2, up: 4.5, look: 0 },
    title: { back: -2.6, up: 3.6, look: 1.4 },
    fovPortrait: 72, fovLandscape: 55,
    fogDensity: 0.05,
  },
  feel: {
    hitstopHurt: 0.08, hitstopHit: 0.05, hitstopKill: 0.09, hitstopParry: 0.12,
    shakeHurt: 0.45, stepDip: 0.14,
  },
};

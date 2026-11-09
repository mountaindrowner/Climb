// Every feel number in one place. Times in seconds, distances in step units unless noted.
export const TUNE = {
  // Free movement along the stair, tuned for a Dead Cells-tight feel. Distances in world units (one per step along the path).
  move: {
    // Movement v2 (0.28): Dead Cells' controls as published by its developer (GDC 2019; his MIT game-feel demo,
    // deepnight/gamefeel): fast from the first step, a double jump from the start, a jump that pops then floats, air
    // control that fades over a long fall, presses kept until they can happen, free turning and a little aim in a fight,
    // a roll that cancels anything. Their exact numbers are unpublished: these are ours, tuned to his size (2.04 tall).
    run: 5.5,             // top speed: no sprint, he always runs fast
    accel: 70,            // top speed in under a tenth of a second
    decel: 60,            // stops in about 0.09 s: a hair of skid, not a slide
    airAccel: 46,         // steering in the air: a touch stronger than on the ground...
    airFade: 2.4, airFloor: 0.4,   // ...fading over a long time in the air, down to this share of it
    crouchMul: 0.27, blockMul: 0.25,   // a crouch-walk is a slow creep
    jumpHeight: 1.55,     // a held jump from the ground: how high the feet rise
    airJumpHeight: 1.35,  // the double jump, from wherever it is pressed
    launch: { at: 0.12, ground: 0.1, air: 0.26 },   // at take-off gravity is this share of itself, back to full over this long: the pop, then the float
    gravityUp: 32, gravityDown: 54, maxFall: 18,
    apexBand: 1.6, apexMul: 0.55,   // holding jump near the top of the arc hangs a moment
    cutMul: 0.42,          // letting go of jump while rising cuts the jump short
    minHop: 0.1,           // ...but never before this, so the quickest tap still clears a broken step
    coyote: 0.1,           // jump still works this long after the ground goes
    buffer: 0.13,          // a jump pressed this long before landing still happens (and not as the double jump)
    flip: 0.36,            // the double jump's somersault
    holeEdge: 0.2,
    fallSafe: 3.6, fallPer: 12,   // a drop longer than fallSafe hurts 1, and 1 more for each fallPer beyond it
    hardLand: 2.6,         // a drop longer than this lands heavily: dust, a jolt, half his speed kept (shorter ones cost nothing)
    roll: { time: 0.4, speed: 7.0, iframeFrom: 0.03, iframeTo: 0.32, cooldown: 0.37, cancel: 0.45 },   // cancel: in the last share of a roll, an attack or a jump ends it
    dive: { speed: 21, min: 1.2, radius: 1.6, dmg: 2, soak: 4, rec: 0.24 },   // down + attack in the air: a plunge; the slam hits both sides; it soaks this much of the fall
    aim: 0.7,              // a swing turns toward a foe behind him this far past the weapon's reach, if no direction is held
    knock: 3.2, knockUp: 3.5, hurtStun: 0.22,
    bonkSpeed: 2.6,        // running into a beam faster than this hurts
  },
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
    wake: 4.8, emerge: 3.2, emergeMax: 1.2, chase: 1.5,
    reach: 1.5, windup: 0.5, lunge: 0.14, lungeDist: 1.1, recover: 0.6, stun: 0.8, parryStun: 1.3, hitStun: 0.35,
    hpFromZone: 2, // crawlers have 2 hp from this zone index on
  },
  spitter: {
    range: 5.6, charge: 0.6, speed: 8, life: 1.4, cooldown: 1.9, reflect: 0.28,   // range: since 0.28's faster run, it sees him coming sooner
  },
  gap: { crumble: 2.0 },                     // since 0.28's faster run (5.5): further off, so the step is gone before he gets there                     // the step starts to fall away when you come this near                     // the step starts to fall away this many steps ahead
  beam: { creak: 3.2 },
  rockfall: { warn: 4.6, fall: 0.55, height: 9, hitRange: 0.7 },
  swing: { length: 2.8, angle: 1.15, settle: 0.5, period: 2.6 },   // a short chain: on a rising stair the arc's uphill side must clear a crouch
  burrower: { wake: 6.6, lead: 4, plough: 6.0, rise: 0.25, snapShut: 0.5, hp: 2 },   // wake, plough: since 0.28's faster run, its jaws are up before he arrives
  flitter: { wake: 4.4, launch: 0.28, dive: 1.0, commit: 0.35, swat: 0.34, leave: 0.8, circle: 1.1 },
  // the Warden at the top of each region (src/boss/golem.js): a colossus in the cavern behind the floor, reaching his
  // fists onto it. Times are [phase 1, phase 2] where paired; every wind-up shortens a little each region (windMul)
  golem: {
    hp: z => 30 + 10 * z,
    poise: z => 7 + 2 * z,   // this much damage to his fists knocks him reeling: his head comes down to the floor
    headMul: 2,              // blows to his head count double
    windMul: z => Math.max(0.72, 1 - 0.045 * z),
    height: 40,              // world units, crown to sole: he stands in the depths, his torso above the floor
    back: 8.5,               // how far behind the stair his shoulders are (from the stair's line, outward)
    shoulder: 9.5,           // how high his shoulders stand above the floor
    trigger: 1.0,            // how far onto the floor before the rubble falls behind you and he wakes
    wake: 3,                 // from how many flights below the floor he is there, looming over the last of the climb to it
    fov: 64,                 // the camera opens out while he is awake, so his head and the floor are both in frame
    intro: 2.6, taunt: 2.0, dying: 2.6, crumble: 3.0, rise: 1.8,
    pause: [0.9, 0.5],
    rest: { s: 3.4, r: 4.6, h: 4.6 },                       // where his hands hover between blows: either side of the floor's middle, out over the drop
    slam:  { wind: [1.0, 0.72], strike: 0.16, hold: [1.5, 1.05], rec: 0.7, half: 1.9, damage: 2, hand: 1.5 },   // half: the fist's reach either side of where it lands; hand: how close you must be to strike it
    sweep: { wind: [0.85, 0.6], cross: [1.0, 0.8], rec: 0.6, half: 1.4, h: 3.0, damage: 1 },                   // h: the hand's height as it crosses (crouch under it)
    reel:  { down: 0.7, hold: [3.4, 2.8], up: 0.8, reach: 4.2 },                                                 // reach: either side of the floor's middle, his head can be struck
    wave:  { speed: 7.5, half: 0.4, height: 0.55, damage: 1 },  // phase 2: a slam sends a shockwave along the floor both ways: jump it
    rocks: { every: 5.5, warn: 1.0, n: 3, half: 0.6, damage: 1 },   // phase 2: the roof comes down where dust trickles first
    well: z => 14 + 6 * z,   // wellstone he leaves
  },
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
    climb: { back: -6.5, up: 4.2, look: 1.7, lead: 0.15 },   // landscape: well back across the open centre
    fight: { back: -7.5, up: 4.8, look: 2.1, lead: 0.17 },   // during the Warden's stretch: out and up, so the wall and the breach are in frame
    fall:  { back: -6.5 },
    pool:  { back: -4, up: 5.5, look: 0 },
    title: { back: -5, up: 4.4, look: 1.6 },
    fovPortrait: 76, fovLandscape: 50,
    lines: 720,          // the internal render height: the chunky pixel look at any window size
    fogDensity: 0.032,   // thinner: the camera is twice as far back
  },
  feel: {
    hitstopHurt: 0.08, hitstopHit: 0.05, hitstopKill: 0.09, hitstopParry: 0.12,
    shakeHurt: 0.45, stepDip: 0.14,
  },
};

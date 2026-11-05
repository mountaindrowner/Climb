// Geometry of the shaft and the stair. Everything in world units unless noted.
import { ZONES } from './zones.js';

export const F = 8;              // steps per flight
export const RISE = 0.55;        // height of one step (was 0.75 in the v3 prototype; lowered for a shallower ramp)
export const LAND = 1.8;         // length of the landing at the top of each flight, in step units
export const FL = F + LAND;      // path length of one flight, in step units
export const FH = F * RISE;      // height of one flight
export const ZF = 15;            // flights per zone
export const ZONE_METERS = 135;  // in-game metres per zone; MPU is derived so the height meter stays stable when RISE is tuned
export const MPU = ZONE_METERS / (ZF * FH); // in-game metres per world unit
export const MAXK = ZONES.length * ZF;      // total flights in the shaft

export const R = 7;              // radius of the stair path
export const OMEGA = 1 / R;      // radians per step unit along the path
export const RW = R + 1.8;       // radius of the shaft wall
export const RP = R - 1.3;       // radius of the open centre (and the Pool)

// Fixed landmarks within every zone, by flight index inside the zone.
export const LIFT_FLIGHT = 6;
export const CAMP_FLIGHT = 10;
export const BOSS_FLIGHT = 14;

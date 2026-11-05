// Title screen: the camera drifts slowly around the empty bottom of the shaft.
import { ST } from '../core/state.js';
export function update(dt){ ST.cam.ang += dt * 0.12; }

// Props from tools/blender/props.py: one file of named pieces (the swinging weight, chain links, boulders, the campfire,
// the low things to crouch under). prop(name) clones a piece once the file has loaded (null before then: callers keep
// their built-in stand-ins and swap when it arrives).
import { loadModel } from './glbModel.js';
export const PROPS = loadModel('props', 'assets/models/props/props.glb');
// tint (a THREE.Color, optional): multiplies the piece's painted colours (each region's own stone)
export function prop(name, tint){
  if (!PROPS.ready) return null;
  const src = PROPS.src.getObjectByName(name);
  if (!src) return null;
  const c = src.clone(true); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0);
  c.traverse(o => { if (!o.isMesh) return; o.frustumCulled = false; if (tint && o.material && !/ember|lamp/.test(o.material.name)){ o.material = o.material.clone(); o.material.color.copy(tint); } });
  return c;
}

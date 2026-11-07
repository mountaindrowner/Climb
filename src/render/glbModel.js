// Creatures from tools/blender/*.py: a GLB loaded once, then cloned per creature with its own bones, clips and
// materials (so a hit flashes only that one), and posed by playing one clip at a fraction of its length.
//   loadModel(key, path): starts the load; the hosted page passes its own URL for key in window.CLIMB_MODEL_URLS
//   instance(M, scale, glowName): a posable copy { g, model, mixer, act, glow, w }; glow is the material named glowName
//   pose(B, clip, frac, dt, rate): that clip at frac (0..1, wrapping), the others faded out
const THREE = window.THREE;
export function loadModel(key, path){
  const M = { ready: false, src: null, clips: [] };
  const url = (window.CLIMB_MODEL_URLS && window.CLIMB_MODEL_URLS[key]) || path;
  if (THREE.GLTFLoader) new THREE.GLTFLoader().load(url, g => { M.src = g.scene; M.clips = g.animations; M.ready = true; }, undefined, () => {});
  return M;
}
// A copy with its own skeleton: the clone's skinned meshes are rebound to the clone's bones (by name: they are unique).
export function cloneSkinned(src){
  const out = src.clone(true), bones = {};
  out.traverse(o => { if (o.isBone) bones[o.name] = o; });
  out.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const sk = o.skeleton; o.bind(new THREE.Skeleton(sk.bones.map(b => bones[b.name]), sk.boneInverses), o.bindMatrix);
  });
  return out;
}
export function instance(M, scale = 1, glowName = null){
  const model = cloneSkinned(M.src), g = new THREE.Group(), pitch = new THREE.Group();
  g.add(pitch); pitch.add(model); model.scale.setScalar(scale);
  let glow = null;
  model.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    if (o.material){ o.material = o.material.clone(); if (glowName && o.material.name === glowName) glow = o.material; }
  });
  const mixer = new THREE.AnimationMixer(model), act = {};
  for (const c of M.clips){ const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); act[c.name] = a; }
  return { g, pitch, model, mixer, act, glow, eye: glow, w: {} };
}
// Cut the copy off below world height y (a thing coming up out of the stone shows only what is above the surface);
// null shows all of it.
export function clipBelow(B, y){
  if (!B.clip){ B.clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); B.model.traverse(o => { if (o.isMesh && o.material) o.material.clippingPlanes = [B.clip]; }); }
  B.clip.constant = y == null ? 1e6 : -y;
}
export function pose(B, name, frac, dt, rate = 14){
  for (const n in B.act){
    const want = n === name ? 1 : 0, w = (B.w[n] || 0) + (want - (B.w[n] || 0)) * Math.min(1, rate * dt);
    B.w[n] = w < 0.01 ? 0 : w; B.act[n].setEffectiveWeight(B.w[n]);
  }
  const a = B.act[name]; if (a) a.time = Math.min(0.9999, frac - Math.floor(frac)) * a.getClip().duration;
  B.mixer.update(0);
}
// a clip held at its end (frac clamped, not wrapped)
export const poseOnce = (B, name, frac, dt, rate) => pose(B, name, Math.max(0, Math.min(0.9999, frac)), dt, rate);

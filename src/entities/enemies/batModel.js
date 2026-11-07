// The flitter's body: the bat from tools/blender/bat.py, loaded once and cloned for each flitter (each with its own
// bones, clips and eyes). Faces +Z, up +Y; its clips: Roost, Unfurl, Fly, Dive, Hit.
const THREE = window.THREE;
export const BAT = { ready: false, src: null, clips: [] };
const url = () => (window.CLIMB_MODEL_URLS && window.CLIMB_MODEL_URLS.bat) || 'assets/models/bat/bat.glb';
if (THREE.GLTFLoader) new THREE.GLTFLoader().load(url(), g => { BAT.src = g.scene; BAT.clips = g.animations; BAT.ready = true; }, undefined, () => {});

// A copy with its own skeleton: the clone's skinned meshes are rebound to the clone's bones (by name: they are unique).
function cloneSkinned(src){
  const out = src.clone(true), bones = {};
  out.traverse(o => { if (o.isBone) bones[o.name] = o; });
  out.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const sk = o.skeleton; o.bind(new THREE.Skeleton(sk.bones.map(b => bones[b.name]), sk.boneInverses), o.bindMatrix);
  });
  return out;
}
export function makeBat(scale = 2){
  const model = cloneSkinned(BAT.src), g = new THREE.Group(), pitch = new THREE.Group();
  g.add(pitch); pitch.add(model); model.scale.setScalar(scale);
  let eye = null;
  model.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    if (o.material){ o.material = o.material.clone(); if (o.material.name === 'bat_eye') eye = o.material; }   // its own materials: a hit flashes only this one
  });
  const mixer = new THREE.AnimationMixer(model), act = {};
  for (const c of BAT.clips){ const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); act[c.name] = a; }
  return { g, pitch, model, mixer, act, eye, w: {} };
}
// Play one clip at a fraction of its length, the others faded out quickly.
export function pose(B, name, frac, dt, rate = 14){
  for (const n in B.act){
    const want = n === name ? 1 : 0, w = (B.w[n] || 0) + (want - (B.w[n] || 0)) * Math.min(1, rate * dt);
    B.w[n] = w < 0.01 ? 0 : w; B.act[n].setEffectiveWeight(B.w[n]);
  }
  const a = B.act[name]; if (a) a.time = (frac - Math.floor(frac)) * a.getClip().duration;
  B.mixer.update(0);
}

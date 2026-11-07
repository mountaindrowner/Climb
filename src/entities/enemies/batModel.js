// The flitter's body: the bat from tools/blender/bat.py, loaded once and cloned for each flitter (each with its own
// bones, clips and eyes). Faces +Z, up +Y; its clips: Roost, Unfurl, Fly, Dive, Hit.
import { loadModel, instance, pose as posePlay } from '../../render/glbModel.js';
export const BAT = loadModel('bat', 'assets/models/bat/bat.glb');
export const makeBat = (scale = 2) => instance(BAT, scale, 'bat_eye');
export const pose = posePlay;

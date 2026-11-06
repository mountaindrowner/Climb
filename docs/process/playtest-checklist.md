# Playtest checklist (phone)

Run through this after any change to feel, and before a build goes to anyone else. File findings as a "Playtest notes" issue.

**Setup**
- Serve the repo (`npm run dev`) and open it on a PC at 1920×1080 (the main target) and on a phone over the local network, held sideways, full screen.
- Reset progress from the title screen for a first-run read; do a second pass with progress kept.

**The step**
- Can you see each foot land? Does the thud, dust, squash and camera dip line up with it?
- Does the ramp read as a climb without the camera feeling tilted?

**Readability**
- Is every hazard icon visible about four steps out at phone size?
- Can you tell slam, sweep and spit apart from the Warden's body alone (phase 2)?
- Are the timing rings readable under a thumb?

**Controls**
- Thumbs never cover the warrior. Buttons never need a look. The parry window feels fair.
- A missed jump is your fault, not the input's.

**The fall**
- Roots are visible before the slow-motion starts. One grab per root feels right. A full plunge is dramatic, not tedious.

**Pacing**
- Note the clock at each rest stop and Warden. Compare with `node tools/pacing.mjs`.

**Progress**
- A repaired lift and a beaten Warden show in the Pool after a reload.

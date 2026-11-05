// Title screen: how to play, best height, reset.
import { S, resetSave } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { setAllFlights } from '../../world/stair.js';
import { showMenu, registerActions } from '../overlay.js';
import { poolMenu } from './pool.js';
import './practice.js';
import { rigChoice, setRigChoice } from '../../entities/player/glbRig.js';

export function titleMenu(){
  ST.mode = 'title';
  showMenu(`<div class="card">
    <h1>The Climb</h1>
    <p class="sub">Fight your way up the spiral of an impossibly deep mine.</p>
    <button class="choice go" data-act="pool">Wake in the Pool</button>
    <button class="choice" data-act="practice-menu"><span>Practice a threat<small>Climb a short stretch of one hazard or creature</small></span><span class="cost">8</span></button>
    <div class="how">
      <b>◀ ▶</b> move along the stair; right climbs. Hold <b>▼</b> to crouch.<br>
      <b>▲</b> jump, repair lifts, grab roots while falling<br>
      <b>A</b> attack, press again to combo · <b>⟳</b> roll through attacks<br>
      <b>B</b> hold to block; raise it as a hit lands to parry<br>
      Keyboard: A/D or arrows, Space jump, J attack, K block, L roll, F flask.<br>
      <b>Flask</b> heals. Only the Pool refills it.<br>
      Fall and you drop all the way down. Repaired lifts stay repaired.
    </div>
    ${S.best ? `<p class="note">Best height ${S.best} m · Falls ${S.falls}</p>` : ''}
    <button class="link" data-act="rig">Warrior: ${rigChoice() === 'blender' ? 'Blender model (tap for hand-built)' : 'hand-built (tap for Blender model)'}</button>
    <button class="link" data-act="reset">Reset progress</button>
  </div>`);
}
registerActions({
  pool(){ ST.lastFall = null; poolMenu(); },
  reset(){ resetSave(); setAllFlights(); titleMenu(); },
  rig(){ setRigChoice(rigChoice() === 'blender' ? 'hand' : 'blender'); titleMenu(); },
});

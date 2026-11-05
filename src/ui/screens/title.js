// Title screen: how to play, best height, reset.
import { S, resetSave } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { setAllFlights } from '../../world/stair.js';
import { showMenu, registerActions } from '../overlay.js';
import { poolMenu } from './pool.js';
import './practice.js';

export function titleMenu(){
  ST.mode = 'title';
  showMenu(`<div class="card">
    <h1>The Climb</h1>
    <p class="sub">Fight your way up the spiral of an impossibly deep mine.</p>
    <button class="choice go" data-act="pool">Wake in the Pool</button>
    <button class="choice" data-act="practice-menu"><span>Practice a threat<small>Climb a short stretch of one hazard or creature</small></span><span class="cost">8</span></button>
    <div class="how">
      <b>You climb on your own.</b> The camera circles with you. Every heavy step is a beat.<br>
      <b>▲</b> jump gaps, repair lifts, grab roots while falling<br>
      <b>▼</b> duck beams and sweeps<br>
      <b>A</b> attack · <b>B</b> block, tap it right as a hit lands to parry<br>
      <b>Flask</b> heals. Only the Pool refills it.<br>
      Fall and you drop all the way down. Repaired lifts stay repaired.
    </div>
    ${S.best ? `<p class="note">Best height ${S.best} m · Falls ${S.falls}</p>` : ''}
    <button class="link" data-act="reset">Reset progress</button>
  </div>`);
}
registerActions({
  pool(){ ST.lastFall = null; poolMenu(); },
  reset(){ resetSave(); setAllFlights(); titleMenu(); },
});

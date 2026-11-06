// Title screen: how to play, best height, reset.
import { S, resetSave } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { setAllFlights } from '../../world/stair.js';
import { showMenu, registerActions } from '../overlay.js';
import { poolMenu } from './pool.js';
import './practice.js';
import { rigChoice, setRigChoice, RIG_ORDER, RIG_LABEL } from '../../entities/player/glbRig.js';
import { sayHTML, onDeviceChange } from '../../core/prompts.js';
import { menuOpen } from '../overlay.js';
import { settingsMenu, controlsMenu } from './settings.js';

export function titleMenu(){
  ST.mode = 'title';
  showMenu(`<div class="card">
    <h1>The Climb</h1>
    <p class="sub">Fight your way up the spiral of an impossibly deep mine.</p>
    <button class="choice go" data-act="pool">Wake in the Pool</button>
    <button class="choice" data-act="practice-menu"><span>Practice a threat<small>Climb a short stretch of one hazard or creature</small></span><span class="cost">8</span></button>
    <div class="how">
      ${sayHTML('{left} {right} move along the stair; right climbs. Hold {down} to crouch.')}<br>
      ${sayHTML('{jump} jump, repair lifts, grab roots while falling')}<br>
      ${sayHTML('{attack} attack, press again to combo · {roll} roll through attacks')}<br>
      ${sayHTML('{block} hold to block; raise it as a hit lands to parry')}<br>
      ${sayHTML('{flask} drinks the flask: it heals, and only the Pool refills it.')}<br>
      Fall and you drop all the way down. Repaired lifts stay repaired.
    </div>
    ${S.best ? `<p class="note">Best height ${S.best} m · Falls ${S.falls}</p>` : ''}
    <button class="link" data-act="rig">Warrior: ${RIG_LABEL[rigChoice()]} (tap for ${RIG_LABEL[nextRig()]})</button>
    <button class="link" data-act="title-settings">Settings</button>
    <button class="link" data-act="title-controls">Controls</button>
    <button class="link" data-act="reset">Reset progress</button>
  </div>`);
}
const nextRig = () => RIG_ORDER[(RIG_ORDER.indexOf(rigChoice()) + 1) % RIG_ORDER.length];
registerActions({
  pool(){ ST.lastFall = null; poolMenu(); },
  reset(){ resetSave(); setAllFlights(); titleMenu(); },
  rig(){ setRigChoice(nextRig()); titleMenu(); },
  'title-settings'(){ settingsMenu('title'); },
  'title-controls'(){ settingsMenu('title'); controlsMenu(); },
});

// the help above names your buttons: redraw it when you pick up a different device
onDeviceChange(() => { if (ST.mode === 'title' && menuOpen() && document.querySelector('#overlay .how')) titleMenu(); });

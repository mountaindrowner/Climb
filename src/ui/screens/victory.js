// The card shown when a Warden falls.
import { showMenu } from '../overlay.js';
export function wardenFellMenu(name, gold, heightM){
  showMenu(`<div class="card"><h2>${name} falls</h2>
    <p class="gold">+${gold} gold</p>
    <p>A lift now runs from the Pool to ${heightM} m.</p>
    <p class="note">The stair above is open.</p>
    <button class="choice go" data-act="resume">Keep climbing</button></div>`);
}

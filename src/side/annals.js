// Corwen's Annals: everything on the mountain, region by region, as Corwen the Annalist has entered it. What he has not
// met is not yet entered. Read from the pause (main.js draws it). Each creature's page is its home region, the region it
// belongs to; some are met higher up too. The words are in the game's own voice (docs/story.md): what a thing is, and
// what it has forgotten. docs/cast.md says why each is where it is.
export const ANNALS = [
  { region: 'The Roots', keeper: { theme: 'roots', art: 'warden/head16', name: 'The Warden', line: 'Set to keep the fallen down. No one told it otherwise.' },
    creatures: [
      { type: 'crawler', name: 'Crawler', art: 'px_crawler', line: 'It eats what falls this far. Most of what falls this far.' },
      { type: 'flitter', name: 'Pale Bat', art: 'px_flitter', line: 'Born in the dark. It has never seen light, and hates it.' },
      { type: 'spitter', name: 'Black Leech', art: 'px_leech', line: 'It drinks what drips from above, and gives it back.' },
      { type: 'burrower', name: 'Delver', art: 'px_burrower', line: 'A blind worm of the deep. It hears every step.' },
      { type: 'sexton', name: 'The Sexton', art: 'px_sexton', line: 'Sent down to bury the dead. Nobody sent word to stop.' } ] },
  { region: 'The Cloister', keeper: { theme: 'cloister', art: 'toll/bell', name: 'The Toll', line: 'It rings for a light it cannot see.' },
    creatures: [
      { type: 'copyist', name: 'Copyist', art: 'px_copyist', line: 'He copies the first page. One blot, and he begins it again.' },
      { type: 'blot', name: 'Blot', art: 'px_blot', line: 'Ink that was spilled, and thrown out, and came back.' },
      { type: 'corrector', name: 'The Corrector', art: 'px_corrector', line: 'He strikes out what is wrong. He has not found a page that is not.' },
      { type: 'slag', name: 'Slag', art: 'px_slag', line: 'What was skimmed off the bells. It wakes when iron rings.' },
      { type: 'crackedbell', name: 'The Cracked Bell', art: 'toll/bell', line: 'The Toll\'s sister. Rung until it broke. It rings only when it is struck.' },
      { type: 'acolyte', name: 'Acolyte', art: 'px_acolyte', line: 'It still keeps the hours. It no longer knows for whom.' },
      { type: 'gargoyle', name: 'Gargoyle', art: 'px_gargoyle', line: 'Set on the eaves to watch the flame. It watches him.' },
      { type: 'wisp', name: 'House-lamp', art: 'px_wisp', line: 'A lamp of the house, burning on with no hand to carry it.' } ] },
  { region: 'The Spires', keeper: { theme: 'spires', art: 'wyrm/head', name: 'The Rime Wyrm', line: 'It coils on the pass, and lets none by.' },
    creatures: [
      { type: 'yeti', name: 'Rimeback', art: 'px_yeti', line: 'Patient as the ice. It throws it at whatever climbs.' },
      { type: 'cairn', name: 'Cairn', art: 'px_cairn', line: 'A reason to turn back, in stones. It follows whoever will not look at it.' },
      { type: 'turned', name: 'The Turned', art: 'px_turned', line: 'He turned back, and stayed. He lets no one up past him.' },
      { type: 'seated', name: 'The Seated', art: 'px_seated', line: 'He sat down to rest. The ice took him slowly. A fire brings him back, and not kindly.' },
      { type: 'harpy', name: 'High Hawk', art: 'px_harpy', line: 'A hawk of the high air. It strikes twice and is gone.' },
      { type: 'wraith', name: 'The Stopped', art: 'px_wraith', line: 'A climber who sat down to rest. The cold kept the rest.' } ] },
  { region: 'The Tempest', keeper: { theme: 'tempest', art: 'thunderhead/mask', name: 'The Thunderhead', line: 'It came when the flame went dark. It is all the sky has left.' },
    creatures: [
      { type: 'squall', name: 'Squall Knight', art: 'px_squall', line: 'The storm took his name and left him his shield.' },
      { type: 'nimbus', name: 'Nimbus', art: 'px_nimbus', line: 'A piece of the storm, wearing its mask.' },
      { type: 'hush', name: 'The Hush', art: 'px_hush', line: 'It does not move while he moves. It comes when he stands still.' },
      { type: 'jar', name: 'The Jar', art: 'px_jar', line: 'The Wrights caught the lightning to keep it. It kept them.' },
      { type: 'spark', name: 'Ball Lightning', art: 'px_spark', line: 'Lightning that will not finish falling.' } ] },
  { region: 'The Gardens', keeper: { theme: 'gardens', art: 'mother/heart', name: 'Mother Thorn', line: 'What the garden grew, untended.' },
    creatures: [
      { type: 'moth', name: 'Moth', art: 'px_housemoth', line: 'It sleeps by a lamp that is trimmed every evening, for no one.' },
      { type: 'housekeeper', name: 'The Housekeeper', art: 'px_housekeeper', line: 'It lays every table and makes every bed. They are not coming.' },
      { type: 'sluicer', name: 'Sluice-keeper', art: 'px_sluicer', line: 'A servant of the house, in stone. It puts each wheel back as it was left.' },
      { type: 'strider', name: 'Water-strider', art: 'px_strider', line: 'Fast on running water. With its water stopped, it sits where it was left.' },
      { type: 'lock', name: 'The Lock', art: 'px_lock', line: 'The gate between the channel and the head. It opens fighting.' },
      { type: 'thornback', name: 'Thornback', art: 'px_thornback', line: 'Kept once, for the keepers\' table. It keeps itself now.' },
      { type: 'lasher', name: 'Lasher', art: 'px_lasher', line: 'It was a flower. No one told it when to stop.' },
      { type: 'toad', name: 'Fountain Toad', art: 'px_toad_b', line: 'It sat in the keepers\' fountain, and was fed. No one feeds it now. It swells anyway.' },
      { type: 'puff', name: 'Rot-pod', art: 'px_puff', line: 'The garden\'s seed, gone bad in the sun.' } ] },
  { region: 'The Firmament', keeper: { theme: 'firmament', art: 'mask_tall_c/stand', name: 'The Fallen', line: 'What he left at the top. It has his walk, and thinks it is him.' },
    creatures: [
      { type: 'sentinel', name: 'Sentinel', art: 'px_sentinel', line: 'Brass, and faithful to a door no one comes to.' },
      { type: 'oculus', name: 'Oculus', art: 'px_oculus', line: 'The great lens, still looking for the star that went out.' },
      { type: 'mote', name: 'Star-cinder', art: 'px_mote', line: 'A cinder of the star that fell. There were very many.' },
      { type: 'roller', name: 'Armillary', art: 'px_roller', line: 'A ring come off the brass sky. It still goes round.' },
      { type: 'almanac', name: 'The Almanac', art: 'px_almanac', line: 'It reads the hour the flame will come back. It has read it many times.' } ] },
  { region: 'The Workings', keeper: { theme: 'workings', art: 'px_mole/stand', name: 'The Auger', line: 'The guild\'s engine. Its order was deeper. It is somewhere below, still at it.' },
    creatures: [
      { type: 'lamprey', name: 'Sump Lamprey', art: 'px_lamprey', line: 'It fastened to the roof when the levels flooded, and never let go.' },
      { type: 'barnacle', name: 'Pit Barnacle', art: 'px_barn_a', line: 'It grew where the water rose, and stayed when the water went down.' } ] },
  { region: 'The Vein', keeper: { theme: 'vein', art: 'px_mole/stand', name: 'The Auger', line: 'It was built here. Its cradle is empty, and its track goes down.' },
    creatures: [
      { type: 'prospector', name: 'Prospector', art: 'px_prospector', line: 'His face to the glitter. It is always a little further on.' },
      { type: 'glimmer', name: 'Glimmer', art: 'px_glimmer_c', line: 'Ore, until it is touched.' },
      { type: 'echo', name: 'The Echo', art: 'px_echo', line: 'It goes where he went, and strikes where he was.' },
      { type: 'assayer', name: 'The Assayer', art: 'px_assayer', line: 'It weighs what is brought to it, and finds it light.' } ] },
  { region: 'The Flooded Levels', keeper: { theme: 'flooded', art: 'px_mole/stand', name: 'The Auger', line: 'The water came in over its track. It was already below.' },
    creatures: [
      { type: 'sunk', name: 'The Sunk', art: 'px_sunk', line: 'They were on the shift the water took. They rise at whoever passes over them.' },
      { type: 'eel', name: 'Blind Eel', art: 'px_eel', line: 'It cannot see him. It feels the water move.' },
      { type: 'pump', name: 'The Pump', art: 'px_pump', line: 'Two hundred years at it. It has never been behind, and never ahead.' } ] },
  { region: 'The Great Shaft', keeper: { theme: 'shaft', art: 'px_mole/stand', name: 'The Auger', line: 'Its hole. It went straight down, and through.' }, creatures: [] },
  { region: 'The Hollow', keeper: { theme: 'hollow', art: 'px_auger/stand', name: 'The Auger', line: 'The guild\'s engine. Its order was: deeper. There is no deeper.' }, creatures: [] },
];
export const PEOPLE_PAGE = [
  { who: 'lamplighter', name: 'Ordric of the Vigil', art: 'px_moth', line: 'An old moth who keeps the lamps, and does not fly at them.' },
  { who: 'wren', name: 'Mirel the Penitent', art: 'px_hermit', line: 'She climbs to arrive deserving it, under a shell not her own.' },
  { who: 'hob', name: 'Hob of the guild', art: 'px_mole2', line: 'A mole who dug for the guild, and is digging still. Always a little further down.' },
  { who: 'scribe', name: 'Corwen the Annalist', art: 'px_rook', line: 'A rook who writes the mountain down, and cannot account for it.' },
];

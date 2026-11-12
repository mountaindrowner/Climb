// Corwen's Annals: everything on the mountain, region by region, as Corwen the Annalist has entered it. What he has not
// met is not yet entered. Read from the pause (main.js draws it). Each creature's page is its home region, the region it
// belongs to; some are met higher up too. The words are in the game's own voice (docs/story.md): what a thing is, and
// what it has forgotten. docs/cast.md says why each is where it is.
export const ANNALS = [
  { region: 'The Roots', keeper: { theme: 'roots', art: 'warden/head16', name: 'The Warden', line: 'Set to keep the fallen down. No one told it otherwise.' },
    creatures: [
      { type: 'crawler', name: 'Crawler', art: 'px_crawler', line: 'It eats what falls this far. Most of what falls this far.' },
      { type: 'flitter', name: 'Pale Bat', art: 'px_flitter', line: 'Born in the dark. It has never seen light, and hates it.' },
      { type: 'spitter', name: 'Bile-sac', art: 'px_spitter', line: 'It drinks what drips from above, and gives it back.' },
      { type: 'burrower', name: 'Delver', art: 'px_burrower', line: 'A blind worm of the deep. It hears every step.' } ] },
  { region: 'The Cloister', keeper: { theme: 'cloister', art: 'toll/bell', name: 'The Toll', line: 'It rings for a light it cannot see.' },
    creatures: [
      { type: 'acolyte', name: 'Acolyte', art: 'px_acolyte', line: 'It still keeps the hours. It no longer knows for whom.' },
      { type: 'gargoyle', name: 'Gargoyle', art: 'px_gargoyle', line: 'Set on the eaves to watch the flame. It watches you.' },
      { type: 'wisp', name: 'House-lamp', art: 'px_wisp', line: 'A lamp of the house, burning on with no hand to carry it.' } ] },
  { region: 'The Spires', keeper: { theme: 'spires', art: 'wyrm/head', name: 'The Rime Wyrm', line: 'It coils on the pass, and lets none by.' },
    creatures: [
      { type: 'yeti', name: 'Rimeback', art: 'px_yeti', line: 'Patient as the ice. It throws it at whatever climbs.' },
      { type: 'harpy', name: 'High Hawk', art: 'px_harpy', line: 'A hawk of the high air. It strikes twice and is gone.' },
      { type: 'wraith', name: 'The Stopped', art: 'px_wraith', line: 'A climber who sat down to rest. The cold kept the rest.' } ] },
  { region: 'The Tempest', keeper: { theme: 'tempest', art: 'thunderhead/mask', name: 'The Thunderhead', line: 'It came when the flame went dark. It is all the sky has left.' },
    creatures: [
      { type: 'squall', name: 'Squall Knight', art: 'px_squall', line: 'The storm took his name and left him his shield.' },
      { type: 'nimbus', name: 'Nimbus', art: 'px_nimbus', line: 'A piece of the storm, wearing its mask.' },
      { type: 'spark', name: 'Ball Lightning', art: 'px_spark', line: 'Lightning that will not finish falling.' } ] },
  { region: 'The Gardens', keeper: { theme: 'gardens', art: 'mother/heart', name: 'Mother Thorn', line: 'What the garden grew, untended.' },
    creatures: [
      { type: 'thornback', name: 'Thornback', art: 'px_thornback', line: 'Kept once, for the keepers\' table. It keeps itself now.' },
      { type: 'lasher', name: 'Lasher', art: 'px_lasher', line: 'It was a flower. No one told it when to stop.' },
      { type: 'puff', name: 'Rot-pod', art: 'px_puff', line: 'The garden\'s seed, gone bad in the sun.' } ] },
  { region: 'The Firmament', keeper: { theme: 'firmament', art: 'mask_tall_c/stand', name: 'The Fallen', line: 'What he left at the top. It has his walk, and thinks it is him.' },
    creatures: [
      { type: 'sentinel', name: 'Sentinel', art: 'px_sentinel', line: 'Brass, and faithful to a door no one comes to.' },
      { type: 'oculus', name: 'Oculus', art: 'px_oculus', line: 'The great lens, still looking. It does not like what it sees.' },
      { type: 'mote', name: 'Star-cinder', art: 'px_mote', line: 'A cinder of the star that fell. There were very many.' } ] },
];
export const PEOPLE_PAGE = [
  { who: 'lamplighter', name: 'Ordric of the Vigil', art: 'px_lamplighter', line: 'Keeps the flames. No one has told him to stop.' },
  { who: 'wren', name: 'Mirel the Penitent', art: 'px_wren', line: 'She climbs to arrive deserving it. She keeps a count.' },
  { who: 'scribe', name: 'Corwen the Annalist', art: 'px_scribe', line: 'He writes the mountain down. He cannot account for it.' },
];

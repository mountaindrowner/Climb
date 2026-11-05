// Gold sources, rest stop prices and the gold-throw gamble.
export const GOLD = {
  nugget: 1,
  crawler: 3,
  spitterParry: 4,
  warden: z => 25 + 10 * z,
};
export const CAMP = {
  refill: 12,
  whetstone: 25,
  whetstoneMax: 2,
  ironHeart: 30,
  ironHeartMax: 2,
  // chance (percent) the thrown pouch bursts: base + 1 per `perMeters` of height, capped
  burstBase: 10,
  burstPerMeters: 4,
  burstCap: 60,
};
export const burstChance = heightM => Math.min(CAMP.burstCap, CAMP.burstBase + Math.floor(heightM / CAMP.burstPerMeters));

// ================================================================
// CITY POOL — Full candidate city database for the scoring engine.
//
// Each entry carries the signals the scorer needs to compute a
// composite priority score:
//
//   tier        — 1 (top-20 US metros) | 2 (mid-size) | 3 (small)
//   pop         — integer population (used as tiebreaker within tier)
//   winterRisk  — 'high' | 'med' | 'low'  (emergency/burst intent)
//   hardWater   — true | false              (water heater/scale intent)
//   dataReady   — true = full CITY_DATA entry exists in lib/cities.js
//                 false = candidate queued for data authoring first
//
// Rule: the scorer ONLY generates a page if dataReady === true.
// Adding a city to this pool does NOT automatically serve pages —
// a full CITY_DATA record must be authored in lib/cities.js first.
// ================================================================

'use strict';

const CITY_POOL = [
  // ── TIER 1 ── top-20 US metros, highest search demand ──────────
  { city: 'New York',      state: 'NY', tier: 1, pop: 8336817, winterRisk: 'high', hardWater: false, dataReady: true  },
  { city: 'Los Angeles',   state: 'CA', tier: 1, pop: 3979576, winterRisk: 'low',  hardWater: true,  dataReady: true  },
  { city: 'Chicago',       state: 'IL', tier: 1, pop: 2693976, winterRisk: 'high', hardWater: false, dataReady: true  },
  { city: 'Houston',       state: 'TX', tier: 1, pop: 2304580, winterRisk: 'med',  hardWater: true,  dataReady: true  },
  { city: 'Phoenix',       state: 'AZ', tier: 1, pop: 1608139, winterRisk: 'low',  hardWater: true,  dataReady: true  },
  { city: 'Philadelphia',  state: 'PA', tier: 1, pop: 1603797, winterRisk: 'high', hardWater: false, dataReady: true  },
  { city: 'San Antonio',   state: 'TX', tier: 1, pop: 1434625, winterRisk: 'med',  hardWater: true,  dataReady: true  },
  { city: 'San Diego',     state: 'CA', tier: 1, pop: 1386932, winterRisk: 'low',  hardWater: true,  dataReady: true  },
  { city: 'Dallas',        state: 'TX', tier: 1, pop: 1304379, winterRisk: 'med',  hardWater: false, dataReady: true  },
  { city: 'San Jose',      state: 'CA', tier: 1, pop: 1013240, winterRisk: 'low',  hardWater: false, dataReady: true  },
  { city: 'Austin',        state: 'TX', tier: 1, pop: 978908,  winterRisk: 'low',  hardWater: true,  dataReady: true  },
  { city: 'Jacksonville',  state: 'FL', tier: 1, pop: 949611,  winterRisk: 'low',  hardWater: false, dataReady: true  },
  { city: 'Fort Worth',    state: 'TX', tier: 1, pop: 935508,  winterRisk: 'med',  hardWater: true,  dataReady: true  },
  { city: 'Columbus',      state: 'OH', tier: 1, pop: 905748,  winterRisk: 'high', hardWater: false, dataReady: true  },
  { city: 'Charlotte',     state: 'NC', tier: 1, pop: 874579,  winterRisk: 'med',  hardWater: false, dataReady: true  },
  { city: 'Indianapolis',  state: 'IN', tier: 1, pop: 887232,  winterRisk: 'high', hardWater: true,  dataReady: true  },
  { city: 'San Francisco', state: 'CA', tier: 1, pop: 873965,  winterRisk: 'low',  hardWater: false, dataReady: true  },
  { city: 'Seattle',       state: 'WA', tier: 1, pop: 737255,  winterRisk: 'low',  hardWater: false, dataReady: true  },
  { city: 'Denver',        state: 'CO', tier: 1, pop: 715522,  winterRisk: 'high', hardWater: false, dataReady: true  },
  { city: 'Nashville',     state: 'TN', tier: 1, pop: 689447,  winterRisk: 'med',  hardWater: false, dataReady: true  },

  // ── TIER 2 ── mid-size metros, solid commercial search volume ───
  { city: 'Oklahoma City', state: 'OK', tier: 2, pop: 695042,  winterRisk: 'med',  hardWater: true,  dataReady: false },
  { city: 'El Paso',       state: 'TX', tier: 2, pop: 678815,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Washington DC', state: 'DC', tier: 2, pop: 689545,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Las Vegas',     state: 'NV', tier: 2, pop: 641903,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Louisville',    state: 'KY', tier: 2, pop: 633045,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Memphis',       state: 'TN', tier: 2, pop: 633104,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Portland',      state: 'OR', tier: 2, pop: 652503,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Baltimore',     state: 'MD', tier: 2, pop: 585708,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Milwaukee',     state: 'WI', tier: 2, pop: 577222,  winterRisk: 'high', hardWater: true,  dataReady: false },
  { city: 'Albuquerque',   state: 'NM', tier: 2, pop: 564559,  winterRisk: 'med',  hardWater: true,  dataReady: false },
  { city: 'Tucson',        state: 'AZ', tier: 2, pop: 542629,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Fresno',        state: 'CA', tier: 2, pop: 542107,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Sacramento',    state: 'CA', tier: 2, pop: 513624,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Kansas City',   state: 'MO', tier: 2, pop: 508090,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Mesa',          state: 'AZ', tier: 2, pop: 504258,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Atlanta',       state: 'GA', tier: 2, pop: 498715,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Colorado Springs', state: 'CO', tier: 2, pop: 478961, winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Raleigh',       state: 'NC', tier: 2, pop: 467665,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Omaha',         state: 'NE', tier: 2, pop: 486051,  winterRisk: 'high', hardWater: true,  dataReady: false },
  { city: 'Long Beach',    state: 'CA', tier: 2, pop: 466742,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Virginia Beach',state: 'VA', tier: 2, pop: 459470,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Minneapolis',   state: 'MN', tier: 2, pop: 429954,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Tampa',         state: 'FL', tier: 2, pop: 399700,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'New Orleans',   state: 'LA', tier: 2, pop: 390144,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Arlington',     state: 'TX', tier: 2, pop: 394266,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Bakersfield',   state: 'CA', tier: 2, pop: 403455,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Cleveland',     state: 'OH', tier: 2, pop: 372624,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Anaheim',       state: 'CA', tier: 2, pop: 350365,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Honolulu',      state: 'HI', tier: 2, pop: 347397,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Aurora',        state: 'CO', tier: 2, pop: 386261,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Santa Ana',     state: 'CA', tier: 2, pop: 310227,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Corpus Christi',state: 'TX', tier: 2, pop: 326586,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Riverside',     state: 'CA', tier: 2, pop: 331360,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Pittsburgh',    state: 'PA', tier: 2, pop: 302971,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'St Louis',      state: 'MO', tier: 2, pop: 301578,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Stockton',      state: 'CA', tier: 2, pop: 320804,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Cincinnati',    state: 'OH', tier: 2, pop: 309317,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Lexington',     state: 'KY', tier: 2, pop: 322570,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Anchorage',     state: 'AK', tier: 2, pop: 291538,  winterRisk: 'high', hardWater: false, dataReady: false },

  // ── TIER 3 ── smaller markets, lower volume but still commercial
  { city: 'St Paul',       state: 'MN', tier: 3, pop: 308096,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Greensboro',    state: 'NC', tier: 3, pop: 299035,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Plano',         state: 'TX', tier: 3, pop: 285494,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Henderson',     state: 'NV', tier: 3, pop: 320189,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Lincoln',       state: 'NE', tier: 3, pop: 289102,  winterRisk: 'high', hardWater: true,  dataReady: false },
  { city: 'Buffalo',       state: 'NY', tier: 3, pop: 255284,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Fort Wayne',    state: 'IN', tier: 3, pop: 270402,  winterRisk: 'high', hardWater: true,  dataReady: false },
  { city: 'Jersey City',   state: 'NJ', tier: 3, pop: 292449,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Chula Vista',   state: 'CA', tier: 3, pop: 275487,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Orlando',       state: 'FL', tier: 3, pop: 307573,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'St Petersburg', state: 'FL', tier: 3, pop: 265098,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Norfolk',       state: 'VA', tier: 3, pop: 242742,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Chandler',      state: 'AZ', tier: 3, pop: 275987,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Laredo',        state: 'TX', tier: 3, pop: 255205,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Madison',       state: 'WI', tier: 3, pop: 258054,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Durham',        state: 'NC', tier: 3, pop: 274291,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Lubbock',       state: 'TX', tier: 3, pop: 258862,  winterRisk: 'med',  hardWater: true,  dataReady: false },
  { city: 'Winston-Salem', state: 'NC', tier: 3, pop: 249545,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Garland',       state: 'TX', tier: 3, pop: 238002,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Glendale',      state: 'AZ', tier: 3, pop: 248325,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Hialeah',       state: 'FL', tier: 3, pop: 223109,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Reno',          state: 'NV', tier: 3, pop: 255601,  winterRisk: 'high', hardWater: true,  dataReady: false },
  { city: 'Baton Rouge',   state: 'LA', tier: 3, pop: 227470,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Irvine',        state: 'CA', tier: 3, pop: 307670,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Chesapeake',    state: 'VA', tier: 3, pop: 249422,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Scottsdale',    state: 'AZ', tier: 3, pop: 258069,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'North Las Vegas',state: 'NV',tier: 3, pop: 262527,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Fremont',       state: 'CA', tier: 3, pop: 230504,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Gilbert',       state: 'AZ', tier: 3, pop: 267918,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Birmingham',    state: 'AL', tier: 3, pop: 212237,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Rochester',     state: 'NY', tier: 3, pop: 211328,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Richmond',      state: 'VA', tier: 3, pop: 226610,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Spokane',       state: 'WA', tier: 3, pop: 222081,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Des Moines',    state: 'IA', tier: 3, pop: 214237,  winterRisk: 'high', hardWater: true,  dataReady: false },
  { city: 'Montgomery',    state: 'AL', tier: 3, pop: 199518,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Modesto',       state: 'CA', tier: 3, pop: 218464,  winterRisk: 'low',  hardWater: true,  dataReady: false },
  { city: 'Fayetteville',  state: 'NC', tier: 3, pop: 211000,  winterRisk: 'med',  hardWater: false, dataReady: false },
  { city: 'Tacoma',        state: 'WA', tier: 3, pop: 219346,  winterRisk: 'low',  hardWater: false, dataReady: false },
  { city: 'Akron',         state: 'OH', tier: 3, pop: 190469,  winterRisk: 'high', hardWater: false, dataReady: false },
  { city: 'Shreveport',    state: 'LA', tier: 3, pop: 187593,  winterRisk: 'low',  hardWater: false, dataReady: false },
];

module.exports = { CITY_POOL };

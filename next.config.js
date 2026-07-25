/** @type {import('next').NextConfig} */

// Deterministic exact-string rewrites for state hub pages.
// Each entry maps ONE specific /plumber-{state} URL to /states/{state}.
// No regex, no wildcards, no prefix matching — zero overlap with city×service
// pages like /plumber-new-york-emergency which are served by pages/[slug].js.
const STATE_REWRITES = [
  { source: '/plumber-new-york',      destination: '/states/new-york'      },
  { source: '/plumber-california',    destination: '/states/california'    },
  { source: '/plumber-texas',         destination: '/states/texas'         },
  { source: '/plumber-florida',       destination: '/states/florida'       },
  { source: '/plumber-illinois',      destination: '/states/illinois'      },
  { source: '/plumber-pennsylvania',  destination: '/states/pennsylvania'  },
  { source: '/plumber-arizona',       destination: '/states/arizona'       },
  { source: '/plumber-ohio',          destination: '/states/ohio'          },
  { source: '/plumber-north-carolina',destination: '/states/north-carolina'},
  { source: '/plumber-indiana',       destination: '/states/indiana'       },
  { source: '/plumber-washington',    destination: '/states/washington'    },
  { source: '/plumber-colorado',      destination: '/states/colorado'      },
  { source: '/plumber-tennessee',     destination: '/states/tennessee'     },
  { source: '/plumber-georgia',       destination: '/states/georgia'       },
  { source: '/plumber-michigan',      destination: '/states/michigan'      },
  { source: '/plumber-virginia',      destination: '/states/virginia'      },
  { source: '/plumber-maryland',      destination: '/states/maryland'      },
  { source: '/plumber-wisconsin',     destination: '/states/wisconsin'     },
  { source: '/plumber-oregon',        destination: '/states/oregon'        },
  { source: '/plumber-nevada',        destination: '/states/nevada'        },
  { source: '/plumber-oklahoma',      destination: '/states/oklahoma'      },
  { source: '/plumber-new-mexico',    destination: '/states/new-mexico'    },
  { source: '/plumber-missouri',      destination: '/states/missouri'      },
  { source: '/plumber-nebraska',      destination: '/states/nebraska'      },
  { source: '/plumber-louisiana',     destination: '/states/louisiana'     },
  { source: '/plumber-minnesota',     destination: '/states/minnesota'     },
  { source: '/plumber-kentucky',      destination: '/states/kentucky'      },
  { source: '/plumber-massachusetts', destination: '/states/massachusetts' },
  { source: '/plumber-district-of-columbia', destination: '/states/district-of-columbia' },
  { source: '/plumber-alabama',       destination: '/states/alabama'       },
  { source: '/plumber-arkansas',      destination: '/states/arkansas'      },
  { source: '/plumber-hawaii',        destination: '/states/hawaii'        },
  { source: '/plumber-idaho',         destination: '/states/idaho'         },
  { source: '/plumber-iowa',          destination: '/states/iowa'          },
  { source: '/plumber-kansas',        destination: '/states/kansas'        },
  { source: '/plumber-rhode-island',  destination: '/states/rhode-island'  },
  { source: '/plumber-utah',          destination: '/states/utah'          },
  { source: '/plumber-alaska',        destination: '/states/alaska'        },
  { source: '/plumber-connecticut',   destination: '/states/connecticut'   },
  { source: '/plumber-new-jersey',    destination: '/states/new-jersey'    },
  { source: '/plumber-south-dakota',  destination: '/states/south-dakota'  },
  { source: '/plumber-delaware',      destination: '/states/delaware'      },
  { source: '/plumber-mississippi',   destination: '/states/mississippi'   },
  { source: '/plumber-north-dakota',  destination: '/states/north-dakota'  },
  { source: '/plumber-montana',       destination: '/states/montana'       },
  { source: '/plumber-wyoming',       destination: '/states/wyoming'       },
  { source: '/plumber-south-carolina',destination: '/states/south-carolina'},
  { source: '/plumber-west-virginia', destination: '/states/west-virginia' },
  { source: '/plumber-new-hampshire', destination: '/states/new-hampshire' },
  { source: '/plumber-vermont',       destination: '/states/vermont'       },
  { source: '/plumber-maine',         destination: '/states/maine'         },
];

const nextConfig = {
  turbopack: {},
  async rewrites() {
    return [
      ...STATE_REWRITES,
      { source: '/sitemap-static/:chunk.xml', destination: '/sitemap-static/:chunk' },
      { source: '/sitemap-cities/:chunk.xml', destination: '/sitemap-cities/:chunk' },
      { source: '/sitemap-states/:state/:chunk.xml', destination: '/sitemap-states/:state/:chunk' },
      { source: '/sitemap-zcta/:state/:chunk.xml', destination: '/sitemap-zcta/:state/:chunk' },
    ];
  },

  // Reduce Vercel Fast Origin Transfer by caching large public assets at the
  // edge (s-maxage) and in browsers (max-age). _next/static already gets
  // immutable long caching; this fixes public/ JSON and image assets.
  async headers() {
    return [
      {
        source: '/nationwide-places.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=31536000, must-revalidate' },
        ],
      },
      {
        source: '/zcta-search.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=31536000, must-revalidate' },
        ],
      },
      {
        source: '/og-image.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon-:size.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/apple-touch-icon.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // PoC: cache one representative fallback-blocking page at the edge for 1h
      // without revalidate/Data Cache writes. If this works, roll out to all
      // dynamic slug routes.
      {
        source: '/plumber-walters-mn-drain-cleaning',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=3600, must-revalidate' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;

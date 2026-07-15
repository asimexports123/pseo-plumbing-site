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
];

const nextConfig = {
  turbopack: {},
  async rewrites() {
    return STATE_REWRITES;
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

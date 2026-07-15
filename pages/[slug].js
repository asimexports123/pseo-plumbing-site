import { parseSlug, getCityBySlug, getStateSlug, SEED_CITIES, SERVICES, cityToSlug, buildSlug } from '../lib/cities';
import { generatePageContent } from '../lib/contentGenerator';
import PlumberPage from '../components/PlumberPage';

// Enumerate all valid city×service slug combinations at build time.
// 50 cities × 5 services = 250 static pages.
export async function getStaticPaths() {
  const paths = [];
  for (const city of SEED_CITIES) {
    const cSlug = cityToSlug(city.name);
    for (const service of SERVICES) {
      paths.push({ params: { slug: buildSlug(cSlug, service.slug) } });
    }
  }
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const rawSlug = params.slug;

  const parsed = parseSlug(rawSlug);
  if (!parsed) {
    return { notFound: true };
  }

  const { citySlug, service } = parsed;

  // Only serve pages for cities with complete data in CITY_DATA.
  // Unknown or incomplete cities return 404 — no fallback content served.
  const knownCity = getCityBySlug(citySlug);
  if (!knownCity) {
    return { notFound: true };
  }

  const cityName = knownCity.name;
  const stateCode = knownCity.stateCode || '';

  let content;
  try {
    content = generatePageContent(cityName, stateCode, service);
  } catch (err) {
    // CityDataError means the city exists in SEED_CITIES but is missing
    // required fields in CITY_DATA — return 404 rather than broken content.
    console.error(`[slug].js generatePageContent error for ${cityName}:`, err.message);
    return { notFound: true };
  }

  const nearbyCities = (knownCity?.nearby || [])
    .map((nSlug) => {
      const c = getCityBySlug(nSlug);
      return c ? { slug: nSlug, name: c.name, stateCode: c.stateCode } : null;
    })
    .filter(Boolean)
    .slice(0, 8);

  return {
    props: {
      cityName,
      stateCode,
      stateHubSlug: stateCode ? `plumber-${getStateSlug(stateCode)}` : null,
      service: service
        ? { slug: service.slug, name: service.name, shortName: service.shortName }
        : null,
      content,
      pageSlug: rawSlug,
      nearbyCities,
    },
  };
}

export default function Page(props) {
  return <PlumberPage {...props} />;
}

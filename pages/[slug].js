import { parseSlug, getCityBySlug, getStateSlug, SEED_CITIES, SERVICES, cityToSlug, buildSlug, isCityQualifiedForService } from '../lib/cities';
import { generatePageContent } from '../lib/contentGenerator';
import { getNearbyPlaces } from '../lib/nationwidePlaces';
import PlumberPage from '../components/PlumberPage';

// Pre-build the existing 155 enriched cities at build time.
// New nationwide cities are generated on demand via fallback: 'blocking'
// and cached via ISR (revalidate every 24 hours).
export async function getStaticPaths() {
  const paths = [];
  for (const city of SEED_CITIES) {
    const cSlug = cityToSlug(city.name);
    for (const service of SERVICES) {
      if (isCityQualifiedForService(city.name, service.slug)) {
        paths.push({ params: { slug: buildSlug(cSlug, service.slug) } });
      }
    }
  }
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const rawSlug = params.slug;

  const parsed = parseSlug(rawSlug);
  if (!parsed) {
    return { notFound: true };
  }

  const { citySlug, service } = parsed;

  // Look up city — checks SEED_CITIES first, then nationwide places dataset
  const knownCity = getCityBySlug(citySlug);
  if (!knownCity) {
    return { notFound: true };
  }

  const cityName = knownCity.name;
  const stateCode = knownCity.stateCode || '';

  // Verify service qualification (e.g., sump-pump only in qualifying states)
  if (service && !isCityQualifiedForService(cityName, service.slug)) {
    return { notFound: true };
  }

  let content;
  try {
    content = generatePageContent(cityName, stateCode, service);
  } catch (err) {
    console.error(`[slug].js generatePageContent error for ${cityName}:`, err.message);
    return { notFound: true };
  }

  // Build nearby cities list
  // For enriched SEED_CITIES, use their curated nearby list.
  // For nationwide places without nearby data, compute geographic nearby
  // places from the Census dataset using lat/lon coordinates.
  let nearbyCities;
  if (knownCity.nearby && knownCity.nearby.length > 0) {
    nearbyCities = knownCity.nearby
      .map((nSlug) => {
        const c = getCityBySlug(nSlug);
        return c ? { slug: nSlug, name: c.name, stateCode: c.stateCode } : null;
      })
      .filter(Boolean)
      .slice(0, 8);
  } else if (stateCode) {
    // Compute nearby places from nationwide dataset
    nearbyCities = getNearbyPlaces(citySlug, stateCode, 8).map(p => ({
      slug: p.slug,
      name: p.name,
      stateCode: p.stateCode,
    }));
  } else {
    nearbyCities = [];
  }

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
    revalidate: 86400, // ISR: revalidate every 24 hours
  };
}

export default function Page(props) {
  return <PlumberPage {...props} />;
}

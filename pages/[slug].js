import { parseSlug, getStateSlug, SEED_CITIES, SERVICES, cityToSlug, buildSlug, isCityQualifiedForService } from '../lib/cities';
import { getCityBySlug } from '../lib/cities-server';
import { generatePageContent } from '../lib/contentGenerator';
import { getNearbyPlacesSync, ensurePlacesMetaLoaded, getStateCodeForSlugSync, ensurePlacesForStateLoaded } from '../lib/nationwidePlaces';
import { getZctasByCitySync, ensureZctasForStateLoaded } from '../lib/hyperlocalPlaces-server';
import { getPageDate } from '../lib/contentVersioning';
import { PRIORITY_SEO } from '../lib/prioritySeo';
import PlumberPage from '../components/PlumberPage';

// Pre-build only the curated SEED_CITIES set at build time (highest-traffic,
// highest-conversion pages per GSC data). All other nationwide cities
// (the former top-1000-by-land-area expansion) are generated on demand via
// fallback: 'blocking' and served statically after first request — same
// content, metadata, schema, and URL, just generated on first hit instead
// of at build time.
export async function getStaticPaths() {
  if (process.env.FULL_BUILD !== 'true') {
    return { paths: [], fallback: 'blocking' };
  }
  const paths = [];
  for (const city of SEED_CITIES) {
    const cSlug = cityToSlug(city.name);
    for (const service of SERVICES) {
      if (isCityQualifiedForService(city.name, service.slug, city.stateCode)) {
        paths.push({ params: { slug: buildSlug(cSlug, service.slug) } });
      }
    }
  }
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  try {
    const rawSlug = params.slug;

    const parsed = parseSlug(rawSlug);
    if (!parsed) {
      return { notFound: true };
    }

    const { citySlug, service } = parsed;

    // Determine stateCode with minimal data loading
    let stateCode = null;
    const seedCity = SEED_CITIES.find(c => cityToSlug(c.name) === citySlug);
    if (seedCity) {
      stateCode = seedCity.stateCode;
    } else {
      await ensurePlacesMetaLoaded();
      stateCode = getStateCodeForSlugSync(citySlug);
    }

    // Load only this state's data shards (not the full 6MB datasets)
    if (stateCode) {
      await ensurePlacesForStateLoaded(stateCode);
      await ensureZctasForStateLoaded(stateCode);
    }

    // Look up city — checks SEED_CITIES first, then nationwide places dataset
    const knownCity = getCityBySlug(citySlug);
    if (!knownCity) {
      return { notFound: true };
    }

    const cityName = knownCity.name;
    stateCode = knownCity.stateCode || '';

    // Verify service qualification (e.g., sump-pump only in qualifying states)
    if (service && !isCityQualifiedForService(cityName, service.slug, stateCode)) {
      return { notFound: true };
    }

    const prioritySeo = PRIORITY_SEO[rawSlug] || null;

    let content;
    try {
      content = generatePageContent(cityName, stateCode, service);
    } catch (err) {
      console.error(`[slug].js generatePageContent error for ${cityName}:`, err.message);
      return { notFound: true };
    }

    // Build nearby cities list
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
      nearbyCities = getNearbyPlacesSync(citySlug, stateCode, 8).map(p => ({
        slug: p.slug,
        name: p.name,
        stateCode: p.stateCode,
      }));
    } else {
      nearbyCities = [];
    }

    // Pre-compute ZCTAs for this city (for AreasWeServe component)
    const cityZctas = getZctasByCitySync(cityToSlug(cityName));

    const lastReviewed = await getPageDate(`city-service:${rawSlug}`);

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
        zctas: cityZctas.map(z => ({ zip: z.zip })),
        lastReviewed,
        metaTitle: prioritySeo ? prioritySeo.title : '',
        metaDescription: prioritySeo ? prioritySeo.meta : '',
      },
      revalidate: 3600,
    };
  } catch (err) {
    console.error(`[slug].js getStaticProps error for ${params.slug}:`, err.message);
    return { notFound: true };
  }
}

export default function Page(props) {
  return <PlumberPage {...props} />;
}

import { getCityBySlug, SERVICES, cityToSlug, buildSlug, isCityQualifiedForService } from '../../../../lib/cities';
import { generatePageContent } from '../../../../lib/contentGenerator';
import { getZctaByZip, getZctasByCity, getNearbyZctas, isZctaQualifiedForService } from '../../../../lib/hyperlocalPlaces';
import { ZipServicePage } from '../../../../components/ZipServicePage';

// Hyperlocal ZIP-service pages are generated on demand via fallback: 'blocking'
// and cached via ISR (revalidate every 24 hours).
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { citySlug, zip, service } = params;

  // Validate ZIP is a real ZCTA mapped to this city
  const zcta = getZctaByZip(zip);
  if (!zcta) {
    return { notFound: true };
  }

  // Verify ZCTA belongs to the requested city
  if (zcta.parentCitySlug !== citySlug) {
    return { notFound: true };
  }

  // Look up parent city
  const knownCity = getCityBySlug(citySlug);
  if (!knownCity) {
    return { notFound: true };
  }

  const cityName = knownCity.name;
  const stateCode = knownCity.stateCode || zcta.stateCode;
  const stateName = zcta.state;

  // Find the service
  const svc = SERVICES.find(s => s.slug === service);
  if (!svc) {
    return { notFound: true };
  }

  // Verify service qualification for this ZCTA's state
  if (!isZctaQualifiedForService(zcta, svc.slug)) {
    return { notFound: true };
  }

  // Generate content from parent city (inherit city-level context)
  let content;
  try {
    content = generatePageContent(cityName, stateCode, svc);
  } catch (err) {
    console.error(`[zip-service] generatePageContent error for ${cityName} ${zip} ${svc.slug}:`, err.message);
    return { notFound: true };
  }

  // Get nearby ZIPs
  const nearbyZips = getNearbyZctas(zip, 6).map(nz => ({
    zip: nz.zip,
    parentCity: nz.parentCity,
    parentCitySlug: nz.parentCitySlug,
    stateCode: nz.stateCode,
  }));

  // Get total ZIP count for this city
  const cityZips = getZctasByCity(citySlug);

  const pageSlug = `${citySlug}/${zip}/${svc.slug}`;

  return {
    props: {
      zip,
      cityName,
      stateCode,
      stateName,
      serviceSlug: svc.slug,
      serviceName: svc.name,
      content,
      nearbyZips,
      cityZipCount: cityZips.length,
      pageSlug,
    },
    revalidate: 86400,
  };
}

export default function Page(props) {
  return <ZipServicePage {...props} />;
}

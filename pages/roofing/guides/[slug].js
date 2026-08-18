import RoofingAuthorityPage, { ROOFING_AUTHORITY_PAGES } from 'components/RoofingAuthorityPage.js';
import { AUTHORITY_PAGE_DATA } from 'lib/roofing/authorityContent.js';

export async function getStaticPaths() {
  return {
    paths: ROOFING_AUTHORITY_PAGES.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const page = AUTHORITY_PAGE_DATA[params.slug];
  if (!page) return { notFound: true };
  return { props: { page }, revalidate: 3600 };
}

export default function Page({ page }) {
  return <RoofingAuthorityPage page={page} />;
}
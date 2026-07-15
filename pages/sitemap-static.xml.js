import { buildStaticUrlset } from './sitemap.xml';

export async function getServerSideProps({ res }) {
  const xml = buildStaticUrlset();
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SitemapStatic() {
  return null;
}

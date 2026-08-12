import fs from 'fs';
import path from 'path';
import { STATES } from '../lib/cities';
import {
  buildSitemapIndex,
  getStaticSitemapChunks,
  getCitySitemapChunks,
  getStateSitemapChunks,
  getZctaSitemapChunks,
} from '../lib/sitemap';
import { ensurePlacesLoaded } from '../lib/nationwidePlaces';
import { ensureZctasLoaded } from '../lib/hyperlocalPlaces-server';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function writePublic(filePath, content) {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

export async function getStaticProps() {
  await ensurePlacesLoaded();
  await ensureZctasLoaded();
  const today = getToday();

  const staticChunks = getStaticSitemapChunks();
  const cityChunks = getCitySitemapChunks();
  const stateMap = new Map();
  const zctaMap = new Map();

  for (const stateObj of STATES) {
    stateMap.set(stateObj, getStateSitemapChunks(stateObj));
    zctaMap.set(stateObj, getZctaSitemapChunks(stateObj));
  }

  // static sitemap chunks
  for (const chunk of staticChunks) {
    writePublic(`sitemap-static/${chunk.chunkIndex}.xml`, chunk.xml);
  }

  // city sitemap chunks
  for (const chunk of cityChunks) {
    writePublic(`sitemap-cities/${chunk.chunkIndex}.xml`, chunk.xml);
  }

  // state and zcta chunks
  for (const stateObj of STATES) {
    for (const chunk of stateMap.get(stateObj)) {
      writePublic(`sitemap-states/${stateObj.slug}/${chunk.chunkIndex}.xml`, chunk.xml);
    }
    for (const chunk of zctaMap.get(stateObj)) {
      writePublic(`sitemap-zcta/${stateObj.slug}/${chunk.chunkIndex}.xml`, chunk.xml);
    }
  }

  // main sitemap index
  const sitemaps = [];
  for (const chunk of staticChunks) {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-static/${chunk.chunkIndex}.xml`, lastmod: today });
  }
  for (const chunk of cityChunks) {
    sitemaps.push({ loc: `${DOMAIN}/sitemap-cities/${chunk.chunkIndex}.xml`, lastmod: today });
  }
  for (const stateObj of STATES) {
    for (const chunk of stateMap.get(stateObj)) {
      sitemaps.push({ loc: `${DOMAIN}/sitemap-states/${stateObj.slug}/${chunk.chunkIndex}.xml`, lastmod: today });
    }
    for (const chunk of zctaMap.get(stateObj)) {
      sitemaps.push({ loc: `${DOMAIN}/sitemap-zcta/${stateObj.slug}/${chunk.chunkIndex}.xml`, lastmod: today });
    }
  }

  writePublic('sitemap.xml', buildSitemapIndex(sitemaps));

  return { notFound: true };
}

export default function SitemapBuildAssets() {
  return null;
}

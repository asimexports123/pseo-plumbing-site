export function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function hashContent(content) {
  const json = typeof content === 'string' ? content : JSON.stringify(content);
  return fnv1a32(json);
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function updateManifestEntries(manifest, entries) {
  const today = getToday();
  const updated = { ...manifest };
  for (const { pageKey, hash } of entries) {
    const existing = updated[pageKey];
    if (!existing || existing.hash !== hash) {
      updated[pageKey] = { hash, date: today };
    }
  }
  return updated;
}

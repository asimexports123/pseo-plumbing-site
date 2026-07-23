const INDEXNOW_KEY = 'yohomefixindexnow2025';
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls || urls.length === 0)) {
      return res.status(400).json({ error: 'urls array required' });
    }

    const body = {
      host: 'yohomefix.com',
      key: INDEXNOW_KEY,
      keyLocation: `${DOMAIN}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10000),
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    return res.status(response.status).json({
      submitted: body.urlList.length,
      status: response.status,
      ok: response.ok || response.status === 202,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

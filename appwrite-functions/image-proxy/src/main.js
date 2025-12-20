export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { query, source = 'pexels' } = JSON.parse(req.body);

    if (!query) {
      return res.json({ error: 'Query is required' }, 400);
    }

    const unsplashKey = process.env.UNSPLASH_KEY;
    const pexelsKey = process.env.PEXELS_KEY;

    log(`Image search: ${query} (source: ${source})`);

    let apiUrl = '';
    let headers = {};

    if (source === 'unsplash') {
      if (!unsplashKey) {
        error('UNSPLASH_KEY not configured');
        return res.json({ error: 'Unsplash not configured' }, 500);
      }
      apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`;
      headers = { Authorization: `Client-ID ${unsplashKey}` };
    } else {
      if (!pexelsKey) {
        error('PEXELS_KEY not configured');
        return res.json({ error: 'Pexels not configured' }, 500);
      }
      apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`;
      headers = { Authorization: pexelsKey };
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      error(`${source} API error: ${response.status}`);
      return res.json({ error: `${source} API failed` }, response.status);
    }

    const data = await response.json();
    log(`Found ${source === 'unsplash' ? data.results?.length : data.photos?.length} images`);

    return res.json(data);
  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};

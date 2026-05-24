const https = require('https');

const fetchId = (query) => {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/g);
        if (matches && matches.length > 0) {
          // find first photo that isn't a profile pic (profile pics usually have profile in url but unsplash images are just photo-xxx)
          // Unsplash uses specific domains, let's just grab the first unique ones
          const unique = [...new Set(matches)];
          resolve(unique[1] || unique[0]); // 0 might be an ad or unrelated
        } else {
          resolve(null);
        }
      });
    });
  });
};

(async () => {
  const queries = ['paneer-curry', 'tandoori-chicken', 'biryani', 'dal-makhani', 'naan-bread', 'indian-thali', 'omelette'];
  for (const q of queries) {
    const url = await fetchId(q);
    console.log(`${q}: ${url}?auto=format&fit=crop&w=400&q=80`);
  }
})();

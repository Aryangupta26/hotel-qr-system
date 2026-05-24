const https = require('https');

const checkUnsplashPhoto = (id) => {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/photos/${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const altMatch = data.match(/alt="(.*?)"/);
        resolve({
          id,
          title: titleMatch ? titleMatch[1] : 'Unknown',
          alt: altMatch ? altMatch[1] : 'Unknown'
        });
      });
    });
  });
};

(async () => {
  const ids = [
    '1631452180519-c014fe946bc0',
    '1604908176997-125f25cc6f3d',
    '1633383718081-22ac93e3db65',
    '1512058564366-18510be2db19',
    '1585937421612-70a008356fbe',
    '1626074353765-517a681e40be',
    '1608897013039-887f21d8c804',
    '1582289545106-efec8b9e6db3',
    '1539755530862-00f623c00f52',
    '1549488344-c49c25055b8b',
    '1546069901-ba9599a7e63c'
  ];

  for (const id of ids) {
    const info = await checkUnsplashPhoto(id);
    console.log(`${id}: ${info.title} | ${info.alt}`);
  }
})();

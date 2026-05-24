const https = require('https');

const searchMealDB = (query) => {
  return new Promise((resolve) => {
    https.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.meals && json.meals.length > 0) {
            resolve(json.meals[0].strMealThumb);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
  });
};

(async () => {
  const queries = ['chicken', 'paneer', 'dal', 'biryani', 'bread', 'egg', 'mushroom'];
  for (const q of queries) {
    const url = await searchMealDB(q);
    console.log(`${q}: ${url}`);
  }
})();

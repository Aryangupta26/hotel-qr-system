const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelqr';

const imageMap = {
  paneer: 'https://www.themealdb.com/images/media/meals/xxpqsy1511452222.jpg', // Matar paneer
  chicken: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg', // Chicken Tikka Masala
  biryani: 'https://www.themealdb.com/images/media/meals/xrttsx1487339558.jpg', // Chicken Biryani
  dal: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg', // Dal Fry
  roti: 'https://www.themealdb.com/images/media/meals/lmc6r51764365554.jpg', // Flatbread
  egg: 'https://www.themealdb.com/images/media/meals/1529446137.jpg', // Egg dish
  mushroom: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg', // Mushroom
  chole: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg', // Dal/Curry
  veg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', // Generic Salad
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
};

const assignImages = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const items = await MenuItem.find({});
    let updatedCount = 0;

    for (let item of items) {
      let matchedUrl = imageMap.default;
      const name = item.name.toLowerCase();
      const cat = item.category.toLowerCase();
      
      const searchStr = name + ' ' + cat;

      // Order matters! Most specific first.
      if (searchStr.includes('chicken') || searchStr.includes('mutton') || searchStr.includes('kebab')) {
        matchedUrl = imageMap.chicken;
      } else if (searchStr.includes('biryani') || searchStr.includes('pulao') || searchStr.includes('rice') || searchStr.includes('chawal')) {
        matchedUrl = imageMap.biryani;
      } else if (searchStr.includes('paneer')) {
        matchedUrl = imageMap.paneer;
      } else if (searchStr.includes('dal') || searchStr.includes('daal')) {
        matchedUrl = imageMap.dal;
      } else if (searchStr.includes('roti') || searchStr.includes('naan') || searchStr.includes('paratha') || searchStr.includes('kulcha') || searchStr.includes('bread') || searchStr.includes('tandoori roti')) {
        matchedUrl = imageMap.roti;
      } else if (searchStr.includes('egg') || searchStr.includes('omlet') || searchStr.includes('omelette')) {
        matchedUrl = imageMap.egg;
      } else if (searchStr.includes('mushroom')) {
        matchedUrl = imageMap.mushroom;
      } else if (searchStr.includes('chole') || searchStr.includes('chhola') || searchStr.includes('bhature')) {
        matchedUrl = imageMap.chole;
      } else if (searchStr.includes('veg') || searchStr.includes('aloo') || searchStr.includes('kofta') || searchStr.includes('gobi') || searchStr.includes('bhindi')) {
        matchedUrl = imageMap.veg;
      } else if (cat === 'starter non veg') {
        matchedUrl = imageMap.chicken;
      } else if (cat === 'starter veg') {
        matchedUrl = imageMap.veg;
      }

      // Assign the URL
      item.image = matchedUrl;
      await item.save();
      updatedCount++;
    }

    console.log(`Successfully assigned accurate mealDB images to ${updatedCount} items!`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

assignImages();

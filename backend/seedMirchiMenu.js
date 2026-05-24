const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelqr';

const mirchiMenu = [
  // --- PAGE 3 ---
  // Chef Special
  { name: 'Paneer Kaleji', price: 360, category: 'Main Course' },
  { name: 'Paneer Salan', price: 370, category: 'Main Course' },
  { name: 'Mushroom Kaleji', price: 400, category: 'Main Course' },
  { name: 'Paneer Dehati (30 Min)', price: 400, category: 'Main Course' },
  { name: 'Elaichi Spl. Paneer', price: 310, category: 'Main Course' },
  { name: 'Chi. Dehati Full (30 Min)', price: 680, category: 'Main Course' },
  { name: 'Chi. Dehati Half (30 Min)', price: 380, category: 'Main Course' },
  { name: 'Chi. Punjabi Full', price: 780, category: 'Main Course' },
  { name: 'Chi. Punjabi Half', price: 425, category: 'Main Course' },
  { name: 'Ela. Sp. Chicken Full', price: 730, category: 'Main Course' },
  { name: 'Ela. Sp. Chicken Half', price: 440, category: 'Main Course' },
  { name: 'Paneer Jaipuri', price: 330, category: 'Main Course' },
  { name: 'Veg Eggcury', price: 280, category: 'Main Course' },

  // Starter Non-Veg
  { name: 'Chicken Mangolian', price: 180, category: 'Starters' },
  { name: 'Chicken Spring Roll', price: 150, category: 'Starters' },
  { name: 'Egg Spring Roll', price: 140, category: 'Starters' },
  { name: 'Chicken Tandoori Full', price: 570, category: 'Starters' },
  { name: 'Chicken Tandoori Half', price: 310, category: 'Starters' },
  { name: 'Chicken Lolypop', price: 320, category: 'Starters' },
  { name: 'Chicken Chilli Dry', price: 230, category: 'Starters' },
  { name: 'Chicken Chilli B. Dry', price: 290, category: 'Starters' },
  { name: 'Chicken 65', price: 290, category: 'Starters' },
  { name: 'Chicken Tikka', price: 320, category: 'Starters' },

  // --- PAGE 8 ---
  // Veg
  { name: 'Navratan Korma', price: 240, category: 'Main Course' },
  { name: 'Veg Do Pyaja', price: 220, category: 'Main Course' },
  { name: 'Mix Veg', price: 210, category: 'Main Course' },
  { name: 'Veg Kofta', price: 230, category: 'Main Course' },
  { name: 'Aloo Jeera', price: 190, category: 'Main Course' },
  { name: 'Aloo Do Pyaja', price: 200, category: 'Main Course' },
  { name: 'Veg Chilly', price: 230, category: 'Main Course' },
  { name: 'Veg Manchurian Gra.', price: 240, category: 'Main Course' },
  { name: 'Chana Masala', price: 230, category: 'Main Course' },
  { name: 'Aloo Dum', price: 240, category: 'Main Course' },
  { name: 'Aloo Dum Kashmiri', price: 280, category: 'Main Course' },

  // Mushroom
  { name: 'Mushroom Masala', price: 280, category: 'Main Course' },
  { name: 'Mush. But. Masala', price: 300, category: 'Main Course' },
  { name: 'Mush. Do Pyaja', price: 290, category: 'Main Course' },
  { name: 'Mushroom Curry', price: 280, category: 'Main Course' },
  { name: 'Mush. Chilly Gravy', price: 290, category: 'Main Course' },
  { name: 'Mush. Munch. G.', price: 310, category: 'Main Course' },
  { name: 'Mushroom Kadahi', price: 300, category: 'Main Course' },
  { name: 'Mush. Mutter Curry', price: 290, category: 'Main Course' },

  // Kaju
  { name: 'Kaju Do Pyaja', price: 320, category: 'Main Course' },
  { name: 'Kaju Korma', price: 340, category: 'Main Course' },
  { name: 'Kaju Kofta', price: 350, category: 'Main Course' },
  { name: 'Kaju Curry', price: 320, category: 'Main Course' },
  { name: 'Kaju Shahi Paneer', price: 340, category: 'Main Course' },

  // --- PAGE 9 ---
  // Rice
  { name: 'Rice', price: 100, category: 'Main Course' }, // Guessed price, no explicit price on menu
  { name: 'Rice Jeera Fry', price: 130, category: 'Main Course' },
  { name: 'Mutter Pulao', price: 170, category: 'Main Course' },
  { name: 'Veg Pulao', price: 180, category: 'Main Course' },
  { name: 'Chicken Pulao', price: 230, category: 'Main Course' },
  { name: 'Navratan Pulao', price: 250, category: 'Main Course' },
  { name: 'Kashmiri Pulao', price: 260, category: 'Main Course' },
  { name: 'Egg Pulao', price: 250, category: 'Main Course' },
  { name: 'Kaju Pulao', price: 260, category: 'Main Course' },
  { name: 'Paneer Pulao', price: 250, category: 'Main Course' },

  // Biryani
  { name: 'Veg Biryani', price: 210, category: 'Main Course' },
  { name: 'Chicken Biryani', price: 260, category: 'Main Course' },
  { name: 'Egg Biryani', price: 240, category: 'Main Course' },
  { name: 'Paneer Biryani', price: 230, category: 'Main Course' },

  // Dal
  { name: 'Dal Plain', price: 120, category: 'Main Course' },
  { name: 'Dal fry', price: 130, category: 'Main Course' },
  { name: 'Butter Dal Fry', price: 140, category: 'Main Course' },
  { name: 'Dal Makhani', price: 160, category: 'Main Course' },
  { name: 'Dal Tadka', price: 150, category: 'Main Course' },

  // --- PAGE 10 ---
  // Chicken
  { name: 'Chic. Butter Mas.', price: 280, category: 'Main Course' },
  { name: 'Butter Chic. (full)', price: 730, category: 'Main Course' },
  { name: 'Butter Chic. (Half)', price: 430, category: 'Main Course' },
  { name: 'Chicken Balti', price: 300, category: 'Main Course' },
  { name: 'Chicken Masala Q', price: 290, category: 'Main Course' },
  { name: 'Chicken Masala F', price: 730, category: 'Main Course' },
  { name: 'Chicken Masala H', price: 430, category: 'Main Course' },
  { name: 'Chic. Do Pyaja Q', price: 290, category: 'Main Course' },
  { name: 'Chic. Do Pyaja H', price: 450, category: 'Main Course' },
  { name: 'Chic. Do Pyaja F', price: 740, category: 'Main Course' },
  { name: 'Chicken Curry Q', price: 280, category: 'Main Course' },
  { name: 'Chicken Curry H', price: 430, category: 'Main Course' },
  { name: 'Chicken Curry F', price: 720, category: 'Main Course' },
  { name: 'Chic. Chi. Gravy', price: 240, category: 'Main Course' },
  { name: 'C. C. Boneless Gravy', price: 300, category: 'Main Course' },
  { name: 'Chic. Kadahi/Handi', price: 295, category: 'Main Course' },
  { name: 'Chic. Kadahi/Handi H', price: 430, category: 'Main Course' },
  { name: 'Chic. Kadahi/Handi F', price: 740, category: 'Main Course' },
  { name: 'Murg Musallam full', price: 760, category: 'Main Course' },
  { name: 'Chi Kali. Mir. Full', price: 740, category: 'Main Course' },
  { name: 'Chi Kali. Mir. Half', price: 440, category: 'Main Course' },
  { name: 'C. Mu. Gravy', price: 310, category: 'Main Course' },
  { name: 'Chik. Nawabi Full', price: 740, category: 'Main Course' },
  { name: 'Chik. Nawabi Half', price: 450, category: 'Main Course' },

  // --- PAGE 7 ---
  // Paneer
  { name: 'Paneer Masala', price: 280, category: 'Main Course' },
  { name: 'Paneer Spicy', price: 290, category: 'Main Course' },
  { name: 'Paneer Twa Masala', price: 300, category: 'Main Course' },
  { name: 'Elaichi Sp.Paneer', price: 320, category: 'Main Course' },
  { name: 'Shahi Paneer', price: 280, category: 'Main Course' },
  { name: 'Paneer Butt. M.', price: 310, category: 'Main Course' },
  { name: 'Paneer Punjabi', price: 325, category: 'Main Course' },
  { name: 'Paneer Jalfrezi', price: 280, category: 'Main Course' },
  { name: 'Paneer Handi', price: 290, category: 'Main Course' },
  { name: 'Paneer Pasanda', price: 320, category: 'Main Course' },
  { name: 'Palak Paneer', price: 280, category: 'Main Course' },
  { name: 'Paneer Korma', price: 300, category: 'Main Course' },
  { name: 'Paneer Do Pyaja', price: 300, category: 'Main Course' },
  { name: 'Muter Paneer', price: 270, category: 'Main Course' },
  { name: 'Paneer Bhujiya', price: 290, category: 'Main Course' },
  { name: 'Paneer Capsicum bh.', price: 280, category: 'Main Course' },
  { name: 'Paneer Kofta', price: 320, category: 'Main Course' },
  { name: 'Malai Kofta', price: 300, category: 'Main Course' },
  { name: 'Paneer Tikka Masala', price: 330, category: 'Main Course' },
  { name: 'Paneer Chilly Gravy', price: 280, category: 'Main Course' },
  { name: 'Paneer Mus. But. Mas.', price: 310, category: 'Main Course' },
  { name: 'Paneer Manchurian G.', price: 310, category: 'Main Course' },
  { name: 'Paneer Balti', price: 315, category: 'Main Course' },
  { name: 'Paneer Kolhapuri', price: 310, category: 'Main Course' },
  { name: 'Paneer Lavabdar', price: 325, category: 'Main Course' },
  { name: 'Paneer Haidrabadi', price: 320, category: 'Main Course' }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing MenuItems...');
    await MenuItem.deleteMany({});
    
    console.log(`Inserting ${mirchiMenu.length} items from Mirchi Restaurant menu...`);
    await MenuItem.insertMany(mirchiMenu);
    
    console.log('Menu seeded successfully!');
  } catch (error) {
    console.error('Error seeding menu:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();

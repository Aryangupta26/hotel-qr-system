const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelqr';

const rasoiData = {
  "restaurantName": "रसोई Restaurant",
  "gst": "5% Extra",
  "categories": [
    {
      "name": "Thali",
      "items": [
        {
          "id": 501,
          "name": "Paneer Sabji Mix Veg Thali",
          "description": "Butter Pulav, Jeera Rice, Plain Rice, Butter Naan, Lachha Paratha, Tandoori Roti, Dal, Salad, Papad, Raita, Sweet 1 Piece",
          "price": 238
        }
      ]
    },
    {
      "name": "Egg",
      "items": [
        { "id": 8, "name": "Omlet", "price": 70 },
        { "id": 10, "name": "Boiled Egg", "price": 55 },
        { "id": 13, "name": "Egg Butter Masala", "price": 125 },
        { "id": 14, "name": "Egg Masala", "price": 120 },
        { "id": 15, "name": "Egg Do Pyaja", "price": 130 },
        { "id": 16, "name": "Egg Curry", "price": 120 },
        { "id": 17, "name": "Egg Bhurji", "price": 95 }
      ]
    },
    {
      "name": "Chole Bhature",
      "items": [
        { "id": 56, "name": "Chhole Bhature", "price": 130 },
        { "id": 57, "name": "Bhatura", "price": 30 },
        { "id": 58, "name": "Chhola", "price": 100 }
      ]
    },
    {
      "name": "Starter Veg",
      "items": [
        { "id": 248, "name": "Babycorn Crispy", "price": 280 },
        { "id": 303, "name": "Paneer 65", "price": 260 },
        { "id": 136, "name": "Paneer Tikka", "price": 310 },
        { "id": 46, "name": "Veg Mongolian", "price": 140 },
        { "id": 47, "name": "Paneer Mongolian", "price": 160 },
        { "id": 137, "name": "Paneer Chilli Dry", "price": 270 },
        { "id": 173, "name": "Mushroom Chilli Dry", "price": 290 },
        { "id": 175, "name": "Mushroom Manchurian Dry", "price": 300 },
        { "id": 164, "name": "Veg Manchurian Dry", "price": 230 },
        { "id": 247, "name": "Babycorn Chilli Dry", "price": 310 },
        { "id": 246, "name": "Potato Chilli Dry", "price": 260 },
        { "id": 141, "name": "Paneer Manchurian Dry", "price": 290 },
        { "id": 36, "name": "Veg Spring Roll", "price": 90 },
        { "id": 44, "name": "Paneer Spring Roll", "price": 120 }
      ]
    },
    {
      "name": "Paneer",
      "items": [
        { "id": 102, "name": "Paneer Masala", "price": 280 },
        { "id": 103, "name": "Paneer Spicy", "price": 290 },
        { "id": 106, "name": "Paneer Twa Masala", "price": 300 },
        { "id": 108, "name": "Elaichi Special Paneer", "price": 320 },
        { "id": 115, "name": "Shahi Paneer", "price": 280 },
        { "id": 116, "name": "Paneer Butter Masala", "price": 280 },
        { "id": 118, "name": "Paneer Punjabi", "price": 310 },
        { "id": 120, "name": "Paneer Jaifreezi", "price": 325 },
        { "id": 121, "name": "Paneer Kadahi", "price": 280 },
        { "id": 122, "name": "Paneer Handi", "price": 290 },
        { "id": 123, "name": "Paneer Pasanda", "price": 320 },
        { "id": 124, "name": "Palak Paneer", "price": 280 },
        { "id": 125, "name": "Paneer Korma", "price": 300 },
        { "id": 127, "name": "Paneer Do Pyaja", "price": 300 },
        { "id": 128, "name": "Mutter Paneer", "price": 270 },
        { "id": 129, "name": "Paneer Bhujia", "price": 290 },
        { "id": 130, "name": "Paneer Capsicum Bhaji", "price": 280 },
        { "id": 133, "name": "Paneer Kofta", "price": 320 },
        { "id": 134, "name": "Malai Kofta", "price": 300 },
        { "id": 135, "name": "Paneer Tikka Masala", "price": 330 },
        { "id": 139, "name": "Paneer Chilli Gravy", "price": 280 },
        { "id": 140, "name": "Paneer Mushroom Butter Masala", "price": 310 },
        { "id": 145, "name": "Paneer Manchurian Gravy", "price": 310 },
        { "id": 361, "name": "Paneer Balti", "price": 315 },
        { "id": 262, "name": "Paneer Kolhapuri", "price": 310 },
        { "id": 263, "name": "Paneer Lavabdar", "price": 325 },
        { "id": 264, "name": "Paneer Haidrabadi", "price": 320 }
      ]
    },
    {
      "name": "Veg",
      "items": [
        { "id": 142, "name": "Navratan Korma", "price": 240 },
        { "id": 143, "name": "Veg Do Pyala", "price": 220 },
        { "id": 144, "name": "Mix Veg", "price": 210 },
        { "id": 156, "name": "Veg Kofta", "price": 230 },
        { "id": 158, "name": "Aloo Jeera", "price": 190 },
        { "id": 159, "name": "Aloo Do Pyaja", "price": 200 },
        { "id": 163, "name": "Veg Chilly", "price": 230 },
        { "id": 165, "name": "Veg Manchurian Gravy", "price": 240 },
        { "id": 166, "name": "Chana Masala", "price": 230 },
        { "id": 167, "name": "Aloo Dum", "price": 240 },
        { "id": 168, "name": "Aloo Dum Kashmiri", "price": 280 }
      ]
    },
    {
      "name": "Mushroom",
      "items": [
        { "id": 169, "name": "Mushroom Masala", "price": 280 },
        { "id": 170, "name": "Mushroom Butter Masala", "price": 300 },
        { "id": 171, "name": "Mushroom Do Pyaja", "price": 290 },
        { "id": 172, "name": "Mushroom Curry", "price": 280 },
        { "id": 174, "name": "Mushroom Chilli Gravy", "price": 290 },
        { "id": 175, "name": "Mushroom Munchurian Gravy", "price": 310 },
        { "id": 226, "name": "Mushroom Kadahi", "price": 300 },
        { "id": 326, "name": "Mushroom Mutter Curry", "price": 290 }
      ]
    },
    {
      "name": "Rice",
      "items": [
        { "id": 192, "name": "Rice", "price": 130 },
        { "id": 193, "name": "Rice Jeera Fry", "price": 170 },
        { "id": 194, "name": "Mutter Pulao", "price": 180 },
        { "id": 195, "name": "Veg Pulao", "price": 230 },
        { "id": 196, "name": "Chicken Pulao", "price": 250 },
        { "id": 197, "name": "Navratan Pulao", "price": 260 },
        { "id": 198, "name": "Kashmiri Pulao", "price": 250 },
        { "id": 203, "name": "Egg Pulao", "price": 260 },
        { "id": 205, "name": "Kaju Pulao", "price": 250 },
        { "id": 206, "name": "Paneer Pulao", "price": 250 }
      ]
    },
    {
      "name": "Biryani",
      "items": [
        { "id": 199, "name": "Veg Biryani", "price": 210 },
        { "id": 207, "name": "Chicken Biryani", "price": 260 },
        { "id": 208, "name": "Egg Biryani", "price": 240 },
        { "id": 209, "name": "Paneer Biryani", "price": 230 }
      ]
    },
    {
      "name": "Dal",
      "items": [
        { "id": 109, "name": "Dal Plain", "price": 120 },
        { "id": 110, "name": "Dal Fry", "price": 130 },
        { "id": 111, "name": "Butter Dal Fry", "price": 140 },
        { "id": 112, "name": "Dal Makhani", "price": 160 },
        { "id": 114, "name": "Dal Tadka", "price": 150 }
      ]
    },
    {
      "name": "Chicken",
      "items": [
        { "id": 212, "name": "Chicken Butter Masala", "price": 280 },
        { "id": 213, "name": "Butter Chicken Full", "price": 730 },
        { "id": 214, "name": "Butter Chicken Half", "price": 430 },
        { "id": 215, "name": "Chicken Balti", "price": 300 },
        { "id": 216, "name": "Chicken Masala Quarter", "price": 290 },
        { "id": 270, "name": "Chicken Masala Full", "price": 730 },
        { "id": 269, "name": "Chicken Masala Half", "price": 430 },
        { "id": 217, "name": "Chicken Do Pyaja Quarter", "price": 290 },
        { "id": 271, "name": "Chicken Do Pyaja Half", "price": 450 },
        { "id": 272, "name": "Chicken Do Pyaja Full", "price": 740 },
        { "id": 218, "name": "Chicken Curry Quarter", "price": 280 },
        { "id": 273, "name": "Chicken Curry Half", "price": 430 },
        { "id": 274, "name": "Chicken Curry Full", "price": 720 },
        { "id": 221, "name": "Chicken Chilli Gravy", "price": 240 },
        { "id": 223, "name": "Chicken Chilli Boneless Gravy", "price": 300 },
        { "id": 225, "name": "Chicken Kadahi/Handi", "price": 295 },
        { "id": 277, "name": "Chicken Kadahi/Handi Half", "price": 430 },
        { "id": 345, "name": "Chicken Kadahi/Handi Full", "price": 740 },
        { "id": 233, "name": "Murg Musallam Full", "price": 760 },
        { "id": 238, "name": "Chicken Kali Mirch Full", "price": 740 },
        { "id": 239, "name": "Chicken Kali Mirch Half", "price": 440 },
        { "id": 251, "name": "Chicken Manchurian Gravy", "price": 310 },
        { "id": 249, "name": "Chicken Nawabi Full", "price": 740 },
        { "id": 250, "name": "Chicken Nawabi Half", "price": 450 }
      ]
    },
    {
      "name": "Starter Non Veg",
      "items": [
        { "id": 48, "name": "Chicken Mongolian", "price": 180 },
        { "id": 37, "name": "Chicken Spring Roll", "price": 150 },
        { "id": 38, "name": "Egg Spring Roll", "price": 140 },
        { "id": 234, "name": "Chicken Tandoori Full", "price": 570 },
        { "id": 235, "name": "Chicken Tandoori Half", "price": 310 },
        { "id": 237, "name": "Chicken Lollypop", "price": 320 },
        { "id": 220, "name": "Chicken Chilli Dry", "price": 230 },
        { "id": 222, "name": "Chicken Chilli Boneless Dry", "price": 290 },
        { "id": 224, "name": "Chicken 65", "price": 290 },
        { "id": 300, "name": "Chicken Tikka", "price": 320 }
      ]
    },
    {
      "name": "Chef Special",
      "items": [
        { "id": 401, "name": "Paneer Kaleji", "price": 360 },
        { "id": 402, "name": "Paneer Salan", "price": 370 },
        { "id": 403, "name": "Mushroom Kaleji", "price": 400 },
        { "id": 400, "name": "Paneer Dehati 30 Min", "price": 400 },
        { "id": 108, "name": "Elaichi Special Paneer", "price": 310 },
        { "id": 413, "name": "Chicken Dehati Full 30 Min", "price": 680 },
        { "id": 414, "name": "Chicken Dehati Half 30 Min", "price": 380 },
        { "id": 415, "name": "Chicken Punjabi Full", "price": 780 },
        { "id": 416, "name": "Chicken Punjabi Half", "price": 425 },
        { "id": 240, "name": "Elaichi Special Chicken Full", "price": 730 },
        { "id": 241, "name": "Elaichi Special Chicken Half", "price": 440 },
        { "id": 265, "name": "Paneer Jaipuri", "price": 330 },
        { "id": 256, "name": "Veg Egg Curry", "price": 280 }
      ]
    },
    {
      "name": "Roti & Bread",
      "items": [
        { "id": 176, "name": "Tandoori Roti", "price": 15 },
        { "id": 177, "name": "Butter Roti", "price": 20 },
        { "id": 178, "name": "Missi Roti", "price": 50 },
        { "id": 179, "name": "Plain Naan", "price": 50 },
        { "id": 180, "name": "Butter Naan", "price": 60 },
        { "id": 90, "name": "Garlic Naan", "price": 75 },
        { "id": 181, "name": "Lachha Paratha", "price": 50 },
        { "id": 183, "name": "Kashmiri Naan", "price": 95 },
        { "id": 184, "name": "Veg Stuff Naan", "price": 80 },
        { "id": 1, "name": "Paneer Paratha", "price": 85 },
        { "id": 2, "name": "Aloo Paratha", "price": 75 },
        { "id": 5, "name": "Plain Paratha", "price": 50 },
        { "id": 6, "name": "Egg Paratha", "price": 85 },
        { "id": 186, "name": "Paneer Stuff Paratha", "price": 75 },
        { "id": 187, "name": "Kulcha Plain", "price": 45 },
        { "id": 188, "name": "Paneer Kulcha", "price": 70 },
        { "id": 189, "name": "Pyaaz Kulcha", "price": 50 },
        { "id": 190, "name": "Butter 10gm", "price": 25 },
        { "id": 228, "name": "Veg Kulcha Stuff", "price": 60 }
      ]
    },
    {
      "name": "Half Items",
      "items": [
        { "id": 315, "name": "Shahi Paneer Half", "price": 150 },
        { "id": 316, "name": "Paneer Butter Masala Half", "price": 150 },
        { "id": 328, "name": "Mutter Paneer Half", "price": 140 },
        { "id": 344, "name": "Mix Veg Half", "price": 135 },
        { "id": 392, "name": "Rice Half", "price": 70 },
        { "id": 393, "name": "Jeera Rice Half", "price": 75 }
      ]
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing MenuItems...');
    await MenuItem.deleteMany({});
    
    const itemsToInsert = [];
    
    // Process categories and items
    rasoiData.categories.forEach(category => {
      category.items.forEach(item => {
        itemsToInsert.push({
          name: item.name,
          price: item.price,
          description: item.description || '',
          category: category.name // using dynamic category!
        });
      });
    });

    console.log(`Inserting ${itemsToInsert.length} items from Rasoi Restaurant...`);
    await MenuItem.insertMany(itemsToInsert);
    
    console.log('Menu seeded successfully with Rasoi Restaurant data!');
  } catch (error) {
    console.error('Error seeding menu:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();

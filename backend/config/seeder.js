const AdminUser = require('../models/AdminUser');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const QRCode = require('qrcode');

const seedDatabase = async () => {
  try {
    // 1. Seed Admin User
    const adminCount = await AdminUser.countDocuments({});
    if (adminCount === 0) {
      console.log('[Seeder] No admin users found. Seeding default credentials...');
      await AdminUser.create({
        username: 'admin',
        password: 'admin123', // Will be hashed by mongoose pre-save hook
        role: 'admin'
      });
      console.log('[Seeder] Default Admin created successfully! Username: admin | Password: admin123');
    }

    // 2. Seed Table QR Codes
    const tableCount = await Table.countDocuments({});
    if (tableCount === 0) {
      console.log('[Seeder] No tables found. Seeding default tables...');
      const defaultTables = ['1', '2', '3'];
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      for (const num of defaultTables) {
        const qrUrl = `${frontendBaseUrl}/table/${num}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 400,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });

        await Table.create({
          tableNumber: num,
          qrCodeDataUrl,
          status: 'active'
        });
      }
      console.log('[Seeder] Default Tables (1, 2, 3) with generated QR codes seeded successfully!');
    }

    // 3. Seed Menu Items
    const menuCount = await MenuItem.countDocuments({});
    if (menuCount === 0) {
      console.log('[Seeder] No menu items found. Seeding gourmet menu...');
      const mockItems = [
        {
          name: 'Crispy Spring Rolls',
          description: 'Golden fried crispy wraps filled with seasonal julienned vegetables and served with sweet chili sauce.',
          price: 6.99,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
          category: 'Starters',
          isAvailable: true
        },
        {
          name: 'Spicy Garlic Paneer',
          description: 'Wok-tossed Indian cottage cheese cubes with bell peppers, fresh garlic, and hot soy chili glaze.',
          price: 8.49,
          image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400',
          category: 'Starters',
          isAvailable: true
        },
        {
          name: 'Classic Butter Chicken',
          description: 'Succulent tandoori grilled chicken chunks simmered in a creamy, velvety tomato butter gravy.',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400',
          category: 'Main Course',
          isAvailable: true
        },
        {
          name: 'Wild Mushroom Risotto',
          description: 'Rich and creamy Italian arborio rice slow-cooked with assorted exotic mushrooms, white wine, and aged parmesan.',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=400',
          category: 'Main Course',
          isAvailable: true
        },
        {
          name: 'Fresh Mint Mojito',
          description: 'A classic highball refresher prepared with lime wedges, clean garden mint leaves, brown sugar, and sparkling soda.',
          price: 4.99,
          image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400',
          category: 'Drinks',
          isAvailable: true
        },
        {
          name: 'Mango Lassi',
          description: 'Creamy, sweet, and smooth traditional yogurt-based cooling drink blended with fresh Alphonso mango pulp.',
          price: 3.99,
          image: 'https://images.unsplash.com/photo-1546173159-315924fd3443?auto=format&fit=crop&q=80&w=400',
          category: 'Drinks',
          isAvailable: true
        },
        {
          name: 'Sizzling Chocolate Brownie',
          description: 'Decadent homemade chocolate brownie topped with clean vanilla bean ice cream and drizzled with hot rich chocolate fudge.',
          price: 7.99,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
          category: 'Desserts',
          isAvailable: true
        },
        {
          name: 'Classic Tiramisu',
          description: 'Delicate coffee-dipped Italian ladyfingers layered with velvety light mascarpone cream and dusted with cocoa powder.',
          price: 6.49,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=400',
          category: 'Desserts',
          isAvailable: true
        }
      ];

      await MenuItem.insertMany(mockItems);
      console.log('[Seeder] Gourmet food menu seeded successfully!');
    }
  } catch (err) {
    console.error('[Seeder Error] Seeding failed:', err.message);
  }
};

module.exports = seedDatabase;

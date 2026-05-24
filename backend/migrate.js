const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');

const LOCAL_URI = 'mongodb://localhost:27017/hotelqr';
const PROD_URI = 'mongodb+srv://ay31452_db_user:0uIlu2X4VHcJeRM5@cluster0.j2rmd1a.mongodb.net/hotelqr?retryWrites=true&w=majority';

async function migrate() {
  try {
    console.log('Connecting to Local DB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    
    console.log('Connecting to Production DB...');
    const prodConn = await mongoose.createConnection(PROD_URI).asPromise();

    const LocalUser = localConn.model('AdminUser', AdminUser.schema);
    const LocalMenuItem = localConn.model('MenuItem', MenuItem.schema);
    const LocalTable = localConn.model('Table', Table.schema);
    const LocalOrder = localConn.model('Order', Order.schema);

    const ProdUser = prodConn.model('AdminUser', AdminUser.schema);
    const ProdMenuItem = prodConn.model('MenuItem', MenuItem.schema);
    const ProdTable = prodConn.model('Table', Table.schema);
    const ProdOrder = prodConn.model('Order', Order.schema);

    console.log('Clearing Production DB (Ensuring clean slate)...');
    await ProdUser.deleteMany({});
    await ProdMenuItem.deleteMany({});
    await ProdTable.deleteMany({});
    await ProdOrder.deleteMany({});

    console.log('Migrating Users...');
    const users = await LocalUser.find().lean();
    if (users.length > 0) {
      await ProdUser.insertMany(users);
      console.log(`- Inserted ${users.length} users.`);
    }

    console.log('Migrating Menu Items...');
    const items = await LocalMenuItem.find().lean();
    if (items.length > 0) {
      await ProdMenuItem.insertMany(items);
      console.log(`- Inserted ${items.length} menu items.`);
    }

    console.log('Migrating Tables...');
    const tables = await LocalTable.find().lean();
    if (tables.length > 0) {
      await ProdTable.insertMany(tables);
      console.log(`- Inserted ${tables.length} tables.`);
    }

    console.log('Migrating Orders...');
    const orders = await LocalOrder.find().lean();
    if (orders.length > 0) {
      await ProdOrder.insertMany(orders);
      console.log(`- Inserted ${orders.length} orders.`);
    }

    console.log('Migration Complete! Closing connections.');
    await localConn.close();
    await prodConn.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

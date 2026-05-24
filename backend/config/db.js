const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelqr';
    console.log(`[Database] Attempting connection to MongoDB at: ${connStr.replace(/:([^:@]+)@/, ':***@')}`);
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Database Error] Connection failed: ${err.message}`);
    console.log(`[Database Note] Proceeding in development mock mode. Orders and menu will be stored in-memory if DB is unreachable.`);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('No MONGO_URI provided in environment. Starting persistent MongoMemoryServer...');
      
      const dbPath = path.resolve(__dirname, '../../db_data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      // Configure a persistent local mongodb instance inside workspace
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          dbName: 'obour_scales'
        }
      });

      mongoUri = mongod.getUri();
      console.log(`MongoMemoryServer started on port: ${mongod.instanceInfo.port}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'obour_scales'
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Fail: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error during database disconnect:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };

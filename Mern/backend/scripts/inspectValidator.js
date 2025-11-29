// backend/scripts/inspectValidator.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lmsdb';
const COLL = 'users'; // change if another collection failing

async function run(){
  try{
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const list = await db.listCollections({ name: COLL }).toArray();
    if (!list.length) {
      console.log('Collection not found:', COLL);
      process.exit(0);
    }
    const info = list[0];
    console.log('Collection info:', JSON.stringify(info, null, 2));

    // If validator in options -> print it
    const options = info.options || {};
    if (options.validator) {
      console.log('Validator for', COLL, ':\n', JSON.stringify(options.validator, null, 2));
      console.log('ValidationLevel:', options.validationLevel || '(not set)');
      console.log('ValidationAction:', options.validationAction || '(not set)');
    } else {
      console.log('No server-side validator set for', COLL);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting validator:', err);
    try { await mongoose.disconnect(); } catch(e){}
    process.exit(1);
  }
}

run();

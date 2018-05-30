import logger from './logger';
// Mongo DB start here

logger.info('Connecting database...');
const mongoose = require('mongoose');
// load VCAP configuration  and service credentials
const vcapCredentials = require('./config/vcap-local.json');

mongoose.connect(vcapCredentials.uri);

mongoose.Promise = global.Promise;

const db = mongoose.connection;

// db.on('error', logger.error('MongoDB connection error'));

export default db;

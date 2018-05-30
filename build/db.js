'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _logger = require('./logger');var _logger2 = _interopRequireDefault(_logger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
// Mongo DB start here

_logger2.default.info('Connecting database...');
const mongoose = require('mongoose');
// load VCAP configuration  and service credentials
const vcapCredentials = require('./config/vcap-local.json');

mongoose.connect(vcapCredentials.uri);

mongoose.Promise = global.Promise;

const db = mongoose.connection;

// db.on('error', logger.error('MongoDB connection error'));
exports.default =
db;
//# sourceMappingURL=db.js.map

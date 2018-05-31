/* @flow */
import { Router } from 'express';
import login from './routes/application/login/index';
import {
  updateDispatchSettlement,
  updatePackageSettlement,
  packageHistory,
} from './routes/application/blockchain/queries';
import {
  viewReports,
  report,
  packageReport,
} from './routes/application/database/queries';
import simulate from './routes/application/generate_data/queries';

const router = new Router();

// Register your routes and middleware to handle them here!!
const defaultEndpoint = (req, res) => {
  res.render('homepagedesktop', { message: 'Home page' });
};

// Mongo DB start here
const mongoose = require('mongoose');

// load VCAP configuration  and service credentials
const vcapCredentials = require('./config/vcap-local.json');

mongoose.connect(vcapCredentials.uri);

router.get('/', defaultEndpoint);

router.post('/login', login);

router.get('/view-reports', viewReports);

router.post('/report', report);

router.get('/package-report', packageReport);

router.post('/update-package-settlement', updatePackageSettlement);

router.post('/update-dispatch-settlement', updateDispatchSettlement);

router.get('/package-history', packageHistory);

router.post('/simulate', simulate);

export default router;

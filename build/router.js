'use strict';Object.defineProperty(exports, "__esModule", { value: true });
var _express = require('express');
var _logger = require('./logger');var _logger2 = _interopRequireDefault(_logger);
var _index = require('./routes/application/login/index');var _index2 = _interopRequireDefault(_index);
var _queries = require('./routes/application/blockchain/queries');




var _queries2 = require('./routes/application/generate_data/queries');var _queries3 = _interopRequireDefault(_queries2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const router = new _express.Router();

// Register your routes and middleware to handle them here!!
const defaultEndpoint = (req, res) => {
  res.render('homepagedesktop', { message: 'Home page' });
};

// Mongo DB start here
const mongoose = require('mongoose');
const { PostalPackage } = require('./models/postalPackageData');

// load VCAP configuration  and service credentials
const vcapCredentials = require('./config/vcap-local.json');

mongoose.connect(vcapCredentials.uri);
// Create  Postal Data for package.
const createPackage = (req, res) => {
  const postalData = {
    dispatchId: req.body.dispatchId,
    packageId: req.body.packageId,
    receptacleId: req.body.receptacleId,
    uniqueId: req.body.uniqueId,
    originPost: req.body.originPost,
    destinationPost: req.body.destinationPost,
    packageType: req.body.packageType,
    weight: req.body.weight,
    currentStatus: req.body.currentStatus,
    settlementStatus: req.body.settlementStatus,
    shipmentStatus: req.body.shipmentStatus,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    dateCreated: req.body.dateCreated };

  const postal = new PostalPackage(postalData);
  postal.save((err, result) => {
    if (err) {
      res.send({ status: 'fails', data: err });
    } else {
      res.send({ status: 'success', data: result });
    }
  });
};

// POST update package
const updatePackage = (req, res) => {
  const { dispatchId, packageId, settlementStatus } = req.body;
  PostalPackage.findOneAndUpdate(
  { dispatchId, packageId },
  { $set: { settlementStatus } }).
  exec(err => {
    if (err) {
      _logger2.default.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send('package updated');
    }
  });
};

// helper function to create Dispatch Object
/* const queryObj = {
  originPost: req.body.originPost,
  destinationPost: req.body.destinationPost,
  startDate: req.body.startDate,
  endDate: req.body.endDate,
  dateCreated: req.body.dateCreated,
}; */
const initializeDispatchObject = (dispatchId, packageType, queryObj) => ({
  dispatchId,
  packageType,
  originPost: queryObj.originPost,
  destinationPost: queryObj.destinationPost,
  startDate: queryObj.startDate,
  endDate: queryObj.endDate,
  dateCreated: queryObj.dateCreated });


// helper function to get an array of dispatchIds from all returned package data objects
const createDispatchIdArray = postalPackageData => {
  const dispatchIdArray = [];
  postalPackageData.forEach(packageObject => {
    if (!dispatchIdArray.includes(packageObject.dispatchId)) {
      dispatchIdArray.push(packageObject.dispatchId);
    }
  });
  return dispatchIdArray;
};

// helper function that creates array of dispatch arrays. Each dispatch array contains all packages with that dispatchId
const createArrayOfDispatches = (dispatchIds, postalPackageData) => {
  const dispatches = [];
  dispatchIds.forEach(dispatchId => {
    const dispatchPackageArray = postalPackageData.filter(
    packageObject => packageObject.dispatchId === dispatchId);

    const dispatch = {
      dispatchId,
      dispatchPackageArray };

    dispatches.push(dispatch);
  });
  return dispatches;
};

// Perform all necessary calculations for front end application
const performDispatchCalculations = (dispatches, queryObj) => {
  const reconciledStatus = ['Reconciled', 'SettlementAgreed'];
  const resultArray = [];
  dispatches.forEach(dispatch => {
    // initialize variables that we will return
    const dispatchObject = initializeDispatchObject(
    dispatch.dispatchId,
    dispatch.dispatchPackageArray[0].packageType,
    queryObj);

    let reconciledPackages = 0;
    let reconciledWeight = 0;
    let unreconciledPackages = 0;
    let unreconciledWeight = 0;
    dispatch.dispatchPackageArray.forEach(packageObject => {
      _logger2.default.debug(
      `Package settlement status is ${packageObject.settlementStatus}`);

      if (reconciledStatus.includes(packageObject.settlementStatus)) {
        reconciledPackages += 1;
        reconciledWeight += packageObject.weight;
      } else {
        unreconciledPackages += 1;
        unreconciledWeight += packageObject.weight;
      }
    });
    dispatchObject.totalReconciledPackages = reconciledPackages;
    dispatchObject.totalReconciledWeight = reconciledWeight;
    dispatchObject.totalUnreconciledPackages = unreconciledPackages;
    dispatchObject.totalUnreconciledWeight = unreconciledWeight;
    resultArray.push(dispatchObject);
  });
  return resultArray;
};

// Get dispatch level report
const report = async (req, res) => {
  const queryObj = {
    originPost: req.body.originPost,
    destinationPost: req.body.destinationPost,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    dateCreated: req.body.dateCreated };

  _logger2.default.info(`Input Params:${JSON.stringify(queryObj)}`);

  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      _logger2.default.debug(`PostalData: ${JSON.stringify(postalData, null, 2)}`);
      const dispatchIds = createDispatchIdArray(postalData);
      _logger2.default.debug(`DispatchIds: ${JSON.stringify(dispatchIds, null, 2)}`);
      const dispatches = createArrayOfDispatches(dispatchIds, postalData);
      _logger2.default.debug(`Dispatches: ${JSON.stringify(dispatches, null, 2)}`);
      const reportData = performDispatchCalculations(dispatches, queryObj); // final array to push completed dispatch data
      res.send({ status: 'success', data: reportData });
    }
  });
};

// Get package details for dispatch
const packageReport = (req, res) => {
  const queryObj = {
    dispatchId: req.query.dispatchId };

  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      res.send({ status: 'success', data: postalData });
    }
  });
};

// Mongo DB changes end here

const viewReports = (req, res) => {
  const { country } = req.query;
  const queryObj = {
    $or: [{ originPost: country }, { destinationPost: country }] };

  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      res.send({ status: 'success', data: postalData });
    }
  });
  // res.status(200).json('');
};

router.get('/', defaultEndpoint);

router.post('/login', _index2.default);

router.get('/view-reports', viewReports);

router.post('/report', report);

router.get('/package-report', packageReport);

router.post('/create-package', createPackage);

router.post('/update-package', updatePackage);

router.post('/update-package-settlement', _queries.updatePackageSettlement);

router.post('/update-dispatch-settlement', _queries.updateDispatchSettlement);

router.get('/package_history', _queries.packageHistory);

router.post('/simulate', _queries3.default);exports.default =

router;
//# sourceMappingURL=router.js.map

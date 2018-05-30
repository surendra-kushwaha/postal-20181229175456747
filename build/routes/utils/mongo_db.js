'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.updateDispatch = exports.updatePackage = exports.createDispatch = exports.createPackage = undefined;var _logger = require('../../logger');var _logger2 = _interopRequireDefault(_logger);
var _postalDispatchData = require('../../models/postalDispatchData');var _postalDispatchData2 = _interopRequireDefault(_postalDispatchData);
var _postalPackageData = require('../../models/postalPackageData');var _postalPackageData2 = _interopRequireDefault(_postalPackageData);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

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

  const postal = new _postalPackageData2.default(postalData);
  postal.save((err, result) => {
    _logger2.default.trace('We have gotten a result from Postal Package Data');
    if (err) {
      res.send({ status: 'fails', data: err });
    } else {
      res.send({ status: 'success', data: result });
    }
  });
};

// Create  Postal Data for dispatch.
const createDispatch = (req, res) => {
  const postalData = {
    dispatchId: req.body.dispatchId,
    originPost: req.body.originPost,
    destinationPost: req.body.destinationPost,
    totalReconciledWeight: req.body.totalReconciledWeight,
    totalReconciledPackages: req.body.totalReconciledPackages,
    totalUnreconciledWeight: req.body.totalUnreconciledWeight,
    totalUnreconciledPackages: req.body.totalUnreconciledPackages,
    packageType: req.body.packageType,
    settlementStatus: req.body.settlementStatus,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    dateCreated: req.body.dateCreated };

  const postal = new _postalDispatchData2.default(postalData);
  postal.save((err, result) => {
    _logger2.default.trace('We have gotten a result from Postal Dispatch Data');
    if (err) {
      res.send({ status: 'fails', data: err });
    } else {
      res.send({ status: 'success', data: result });
    }
  });
};

// POST updateDispatch at dispatch level
const updateDispatch = (req, res) => {
  const { dispatchId, settlementStatus } = req.body;
  _postalDispatchData2.default.findOneAndUpdate(
  { dispatchId },
  { $set: { settlementStatus } }).
  exec(err => {
    _logger2.default.trace('We have gotten a result from Postal Dispatch Data');
    if (err) {
      _logger2.default.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send('dispatch updated');
    }
  });
};

// POST update package
const updatePackage = (req, res) => {
  const { dispatchId, packageId, settlementStatus } = req.body;
  _postalPackageData2.default.findOneAndUpdate(
  { dispatchId, packageId },
  { $set: { settlementStatus } }).
  exec(err => {
    _logger2.default.trace('We have gotten a result from Postal Package Data');
    if (err) {
      _logger2.default.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send('package updated');
    }
  });
};exports.

createPackage = createPackage;exports.createDispatch = createDispatch;exports.updatePackage = updatePackage;exports.updateDispatch = updateDispatch;
//# sourceMappingURL=mongo_db.js.map

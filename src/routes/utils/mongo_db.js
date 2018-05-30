import logger from '../../logger';
import PostalDispatch from '../../models/postalDispatchData';
import PostalPackage from '../../models/postalPackageData';

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
    dateCreated: req.body.dateCreated,
  };
  const postal = new PostalPackage(postalData);
  postal.save((err, result) => {
    logger.trace('We have gotten a result from Postal Package Data');
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
    dateCreated: req.body.dateCreated,
  };
  const postal = new PostalDispatch(postalData);
  postal.save((err, result) => {
    logger.trace('We have gotten a result from Postal Dispatch Data');
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
  PostalDispatch.findOneAndUpdate(
    { dispatchId },
    { $set: { settlementStatus } },
  ).exec(err => {
    logger.trace('We have gotten a result from Postal Dispatch Data');
    if (err) {
      logger.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send('dispatch updated');
    }
  });
};

// POST update package
const updatePackage = (req, res) => {
  const { dispatchId, packageId, settlementStatus } = req.body;
  PostalPackage.findOneAndUpdate(
    { dispatchId, packageId },
    { $set: { settlementStatus } },
  ).exec(err => {
    logger.trace('We have gotten a result from Postal Package Data');
    if (err) {
      logger.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send('package updated');
    }
  });
};

export { createPackage, createDispatch, updatePackage, updateDispatch };

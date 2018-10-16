import logger from '../../../logger';
import postal from '../../../lib/postal';

const {
  findOnePackage,
  findPackages,
} = require('../../../lib/postalPackageDataController');
const { updateAllPackages } = require('./utilities');

const updateDispatchSettlement = async (req, res) => {
  // logger.trace('Entered updateDispatchSettlement');
  const queryObj = {
    dispatchId: req.body.dispatchId,
  };
  if (
    queryObj.dispatchId === undefined ||
    queryObj.dispatchId === '""' ||
    queryObj.dispatchId === 'none' ||
    queryObj.dispatchId === 'NONE' ||
    queryObj.dispatchId === '"none"' ||
    queryObj.dispatchId === '"NONE"' ||
    queryObj.dispatchId === ''
  ) {
    queryObj.originPost = req.body.originPost;
    queryObj.destinationPost = req.body.destinationPost;
    queryObj.startDate = req.body.startDate;
    queryObj.endDate = req.body.endDate;
    queryObj.dateCreated = req.body.dateCreated;
    queryObj.packageType = req.body.packageType;
    queryObj.dispatchId = '';
  } else {
    queryObj.dispatchId = req.body.dispatchId;
  }
  const newSettlementStatus = req.body.newStatus;
  let filteredPackages = [];

  try {
    const packages = await findPackages(queryObj);
    if (newSettlementStatus === 'Settlement Disputed') {
      const allowedSettlementStatuses = [
        'Reconciled',
        'Settlement Agreed',
        'Settlement Requested',
      ];
      filteredPackages = packages.filter(pack =>
        allowedSettlementStatuses.includes(pack.settlementStatus),
      );
    } else if (newSettlementStatus === 'Settlement Requested') {
      const allowedSettlementStatuses = [
        'Unreconciled',
        'Settlement Disputed',
        'Dispute Confirmed',
      ];
      filteredPackages = packages.filter(pack =>
        allowedSettlementStatuses.includes(pack.settlementStatus),
      );
    } else if (newSettlementStatus === 'Settlement Agreed') {
      const allowedSettlementStatuses = ['Settlement Requested'];
      filteredPackages = packages.filter(pack =>
        allowedSettlementStatuses.includes(pack.settlementStatus),
      );
    } else if (newSettlementStatus === 'Dispute Confirmed') {
      const allowedSettlementStatuses = ['Settlement Disputed'];
      filteredPackages = packages.filter(pack =>
        allowedSettlementStatuses.includes(pack.settlementStatus),
      );
    } else {
      logger.error('The new settlement status is not recognized!');
    }
    try {
      if (filteredPackages.length > 0) {
        await updateAllPackages(filteredPackages, newSettlementStatus);
      }
    } catch (err) {
      logger.error(
        'Error updating packages in the dispatch to new Settlement Status',
      );
      res.sendStaus(400);
    }
  } catch (err) {
    logger.error(`There was an error updating Settlement Status. ${err}`);
    res.status(400).send(err);
  }

  try {
    const updatedPackages = await findPackages(queryObj);
    // res.status(200).json(updatedPackages);
    res.send(updatedPackages);
  } catch (err) {
    res.sendStatus(400);
  }
};

const updatePackageSettlement = async (req, res) => {
  // logger.trace('Entered updatePackageSettlement');
  // Connect to local database (PostalPackage) and grab packageUUID by using parameters given in swagger (packageId)
  // PostalPackage.find({}, 'packageUUID', async (err, data) => {
  // add query parameters from front end
  // if (err) {
  //   res.send(400);
  // } else {
  // pass packageUUID and newSettlementStatus to postal
  const payload = {
    packageId: req.body.id,
    newSettlementStatus: req.body.newStatus,
    lastUpdated: new Date(),
  }; // need to add transformation logic
  logger.debug(`Paylod : ${JSON.stringify(payload)}`);
  try {
    const updatedPackageId = await postal.updateSettlementStatus(payload);
    logger.debug(`updatedPackageId : ${JSON.stringify(updatedPackageId)}`);
    // once call to postal is complete grab updated package from database and send to front end
    try {
      const newData = await findOnePackage(updatedPackageId.data);
      logger.debug(`RESPONSE : ${JSON.stringify(newData)}`);
      //res.status(200).json(newData[0]);
      res.send(newData[0]);
    } catch (err) {
      res.sendStatus(400);
    }
  } catch (err) {
    logger.error(`There was an error updating Settlement Status. ${err}`);
    res.status(400).send(err);
  }
};

/* const packageHistory = async (req, res) => {
  logger.trace('Entered packageHistory');
  const history = await postal.getPackageHistory(req.query.packageId);
  // may need to do some transformations on history
  res.status(200).json(history);
}; */

const packageHistory = async (req, res) => {
  logger.info('Entered packageHistory');
  try {
    const response = await postal.getPackageHistory(req.query.packageId);
    if (!response) {
      res.status(405).send('Package History response came back empty');
    } else {
      const historyArray = [];
      response.forEach(transax => {
        // logger.info(`Transax: ${JSON.stringify(transax, null, 2)}`);
        const historyData = {
          date: transax.value.LastUpdated,
        };
        if (
          String(transax.value.TransactionName) === 'updateSettlementStatus'
        ) {
          historyData.status = transax.value.SettlementStatus;
          historyData.statusType = 'Settlement Status';
        } else if (transax.value.TransactionName === 'createPostalPackage') {
          const creationHistoryData = {
            date: transax.value.LastUpdated,
            status: transax.value.ShipmentStatus,
            statusType: 'Shipment Status',
          };
          historyArray.push(creationHistoryData);
          historyData.status = transax.value.SettlementStatus;
          historyData.statusType = 'Settlement Status';
        } else {
          historyData.status = transax.value.ShipmentStatus;
          historyData.statusType = 'Shipment Status';
        }

        // logger.info(`History data: ${JSON.stringify(historyData)}`);
        historyArray.push(historyData);
      });
      res.status(200).send(historyArray);
    }
  } catch (error) {
    res.status(405).send(error);
  }
};

export { updateDispatchSettlement, updatePackageSettlement, packageHistory };

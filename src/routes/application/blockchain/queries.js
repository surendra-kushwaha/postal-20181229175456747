import logger from '../../../logger';
import postal from '../../../lib/postal';

const { PostalPackage } = require('../../../models/postalPackageData');

const noneArray = [undefined, '""', 'none', 'NONE', '"none"', '"NONE"', ''];

/**
 * Promise.settle is a way to take an array of Promises, executing in parallel,
 * and wait until they are all complete regardless of failure or success.
 * It is also possible to tell which promises failed and which were successful
 *
 * This differs from Promise.all since Promise.all will stop executing
 * if any of the promises in the array fail
 */
// eslint-disable-next-line func-names
Promise.settle = function(promises) {
  return Promise.all(
    promises.map(p =>
      // make sure any values or foreign promises are wrapped in a promise
      Promise.resolve(p).catch(err => {
        // make sure error is wrapped in Error object so we can reliably detect which promises rejected
        if (err instanceof Error) {
          return err;
        }
        const errObject = new Error();
        errObject.rejectErr = err;
        return errObject;
      }),
    ),
  );
};

const updateAllPackages = (packages: Array, newSettlementStatus: String) => {
  logger.debug(
    `Update All Packages called. ${JSON.stringify(
      packages,
    )},${newSettlementStatus}`,
  );
  const lastUpdated = new Date();
  const promises = [];
  packages.forEach(pack => {
    logger.debug(
      `Updating settlement status for one of many packages: ${JSON.stringify(
        pack,
      )}`,
    );
    const updateSettlementPayload = {
      packageId: pack.packageId,
      newSettlementStatus,
      lastUpdated,
    };
    promises.push(postal.updateSettlementStatus(updateSettlementPayload));
  });
  return Promise.settle(promises);
};

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
  PostalPackage.find(queryObj, async (error, packages) => {
    if (error) {
      res.sendStatus(400);
    } else {
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

      PostalPackage.find(queryObj, (updateError, updatedPackages) => {
        if (updateError) {
          res.sendStatus(400);
        } else {
          res.status(200).json(updatedPackages);
        }
      });
    }
  });
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
  try {
    const updatedPackageId = await postal.updateSettlementStatus(payload);
    // once call to postal is complete grab updated package from database and send to front end
    PostalPackage.find(
      { packageId: updatedPackageId.data },
      (error, newData) => {
        if (error) {
          res.sendStatus(400);
        } else {
          // logger.debug(`NewData: ${JSON.stringify(newData)}`);
          res.status(200).json(newData[0]); // need to add returned data transformation logic
        }
      },
    );
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
    const response = await postal.getPackageHistory(req.body.packageId);
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

        // Adding this statement to make sequential dups work
        if (req.body.packageId.match('[A-Z]{2}6666[0-9]{5}[A-Z]{2}')) {
          if (req.body.dispatchId === transax.value.dispatchId) {
            historyArray.push(historyData);
          } else if (noneArray.includes(transax.value.dispatchId)) {
            historyArray.push(historyData);
          } else {
            // if dispatchIds do not match and dispatchId is not NONE, then do not add to historyArray
          }
        } else {
          historyArray.push(historyData);
        }
      });
      res.status(200).send(historyArray);
    }
  } catch (error) {
    res.status(405).send(error);
  }
};

export { updateDispatchSettlement, updatePackageSettlement, packageHistory };

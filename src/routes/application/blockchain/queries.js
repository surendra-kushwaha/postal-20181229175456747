import logger from '../../../logger';
import postal from '../../../lib/postal';

const { PostalPackage } = require('../../../models/postalPackageData');

const updateDispatchSettlement = (req, res) => {
  // logger.trace('Entered updateDispatchSettlement');
  res.status(200).json('');
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
          logger.debug(`NewData: ${JSON.stringify(newData)}`);
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
    const response = await postal.getPackageHistory(req.query.packageId);
    if (!response) {
      res.status(405).send('Package History response came back empty');
    } else {
      const historyArray = [];
      response.forEach(transax => {
        logger.info(`Transax: ${JSON.stringify(transax, null, 2)}`);
        const historyData = {
          date: transax.value.LastUpdated,
        };
        if (transax.value.TransactionName === 'updateSettlementStatus') {
          historyData.status = transax.value.SettlementStatus;
          historyData.statusType = 'Settlement Status';
        }
        if (transax.value.TransactionName === 'createPostalPackage') {
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

        logger.info(`History data: ${JSON.stringify(historyData)}`);
        historyArray.push(historyData);
      });
      res.status(200).send(historyArray);
    }
  } catch (error) {
    res.status(405).send(error);
  }
};

export { updateDispatchSettlement, updatePackageSettlement, packageHistory };

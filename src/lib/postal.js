import logger from '../logger';
import { postalscm_lib, options } from './postalPackageBlockchainController';

const {
  updateOnePackage,
  createPackage,
} = require('./postalPackageDataController');

class Postal {
  /**
   * Need to have the mapping from bizNetwork name to the URLs to connect to.
   * bizNetwork name will be able to be used by Composer to get the suitable model files.
   *
   */

  async createPackage(payload, startDate, endDate) {
    logger.debug('Postal:<createPackage>');
    const {
      packageId,
      weight,
      originCountry,
      destinationCountry,
      settlementStatus,
      shipmentStatus,
      packageType,
      receptacleId,
      dispatchId,
      lastUpdated,
    } = payload;

    const argsValue = [
      `{"PackageID":"${packageId}", "Weight":"${weight}" , "OriginCountry":"${originCountry}" , "DestinationCountry":"${destinationCountry}", "SettlementStatus":"${settlementStatus}" , "ShipmentStatus":"${shipmentStatus}", "OriginReceptacleID":"${receptacleId}",  "PackageType":"${packageType}", "DispatchID":"${dispatchId}" , "LastUpdated":"${lastUpdated}"}`,
    ];

    options.method_type = 'invoke';
    options.func = 'createPostalPackage';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, async (err, response) => {
        logger.debug('callback from blockchain');
        if (err) {
          logger.error(`Unable to create package in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
          logger.debug({ status: 'success', data: response });
          //const blockchainPackage = JSON.parse(response.data);
          const blockchainPackage = JSON.parse(response);
          // create today's date
          const todateTimeStamp = new Date();
          let today = `${todateTimeStamp.getMonth() +
            1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;
          if (todateTimeStamp.getMonth() + 1 < 10) {
            today = `0${todateTimeStamp.getMonth() +
              1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;
          }
          // Save the data to DB start
          const postalData = {
            dispatchId: blockchainPackage.DispatchID,
            packageId: blockchainPackage.PackageID,
            receptacleId: blockchainPackage.OriginReceptacleID,
            uniqueId: '',
            originPost: blockchainPackage.OriginCountry,
            destinationPost: blockchainPackage.DestinationCountry,
            packageType: blockchainPackage.PackageType,
            weight: blockchainPackage.Weight,
            settlementStatus: blockchainPackage.SettlementStatus,
            shipmentStatus: blockchainPackage.ShipmentStatus,
            startDate,
            endDate,
            dateCreated: today,
          };
          if (
            postalData.dispatchId === undefined ||
            postalData.dispatchId === '""' ||
            postalData.dispatchId === 'none' ||
            postalData.dispatchId === 'NONE' ||
            postalData.dispatchId === '"none"' ||
            postalData.dispatchId === '"NONE"'
          ) {
            postalData.dispatchId = '';
          }
          // saving data in database NOTE: would like to make this asyncronous through an event at some point

          try {
            const result = await createPackage(postalData);
            logger.info('Create Package data saved successfully to mongodb');
            resolve(result);
          } catch (err) {
            logger.info(`Unable to save created package in database: ${err}`);
            reject(err);
          }
          // Save the data to DB end
        } else {
          reject(
            new Error(
              `There was an unknown error while creating the package (${packageId}).`,
            ),
          );
        }
      }),
    );
  }

  async getPackageHistory(packageId) {
    logger.debug('Postal:<getPackageHistory>');

    const argsValue = [packageId];
    options.method_type = 'query';
    options.func = 'getPackageHistory';
    options.args = argsValue;
    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, (err, response) => {
        if (err) {
          reject(err);
        } else if (!err) {
          resolve(response.parsed);
        } else {
          // eslint-disable-line prefer-promise-reject-errors
          reject(
            'Something went wrong getting the package history. Please try again',
          );
        }
      }),
    );
  }

  async updateShipmentStatus(payload) {
    // logger.debug('Postal:<updateShipmentStatus>');
    const {
      packageId,
      shipmentStatus,
      receptacleId,
      dispatchId,
      lastUpdated,
    } = payload;

    const argsValue = [
      String(packageId),
      String(shipmentStatus),
      String(receptacleId),
      String(dispatchId),
      String(lastUpdated),
    ];

    options.method_type = 'invoke';
    options.func = 'updateShipmentStatus';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, async (err, response) => {
        if (err) {
          logger.error(`Unable to update package in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
        	const blockchainPackage = JSON.parse(response);	
          logger.info(`Package (${blockchainPackage.PackageID}) updated on blockchain.`);
          const updateConditions = { packageId: blockchainPackage.PackageID };

          const updateObj = {
            shipmentStatus,
            receptacleId,
            dispatchId,
            lastUpdated,
          };

          logger.debug(
            `Conditions for update: ${JSON.stringify(updateConditions)}`,
          );

          try {
            const result = await updateOnePackage(response.data, updateObj);
            logger.debug('package data saved successfully to mongodb');
            resolve(result);
          } catch (err) {
            logger.error(
              `Unable to save update to package in blockchain. ${err}`,
            );
            reject(err);
          }
        } else {
          reject(
            new Error(
              `There was an unknown error while updating the shipment status (${
                response.data
              }).`,
            ),
          );
        }
      }),
    );
  }

  async updateSettlementStatus(payload) {
    logger.info('Postal:<updateSettlementStatus>');
    logger.debug('Payload received:', payload);
    const { packageId, lastUpdated } = payload;
    const settlementStatus = payload.newSettlementStatus;

    const argsValue = [
      String(packageId),
      String(settlementStatus),
      String(lastUpdated),
    ];

    options.method_type = 'invoke';
    options.func = 'updateSettlementStatus';
    options.args = argsValue;

    logger.debug(
      `Options for updateSettlementStatus: ${JSON.stringify(options)}`,
    );
    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, async (err, response) => {
        if (err) {
          logger.debug({ status: 'error', data: [err, response] });
          reject(err);
        } else if (!err) {
          logger.debug({ status: 'success', data: response });
          
          const updateObj = {
            settlementStatus, // should be response.shipmentStatus
            lastUpdated,
          };
          const blockchainPackage = JSON.parse(response);
          try {
            const result = await updateOnePackage(blockchainPackage.PackageID, updateObj);
            logger.debug('package data saved successfully to mongodb');
            resolve(result);
          } catch (err) {
            logger.debug({ status: 'fails', data: err });
            reject(err);
          }
        } else {
          logger.debug({
            status: 'fail',
            data: {
              msg:
                'Something went wrong updating settlement status. Please try again',
            },
          });
          reject();
        }
      }),
    );
  }
}

const postal = new Postal();

export default postal;

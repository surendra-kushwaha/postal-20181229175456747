/* eslint-disable no-dupe-class-members */
/* eslint-disable class-methods-use-this */
import logger from '../logger';
// eslint-disable-next-line camelcase
import { postalscm_lib, options } from './postalPackageBlockchainController';

class Postal {
  /**
   * Need to have the mapping from bizNetwork name to the URLs to connect to.
   * bizNetwork name will be able to be used by Composer to get the suitable model files.
   *
   */

  async createPackage(payload) {
    logger.debug('Postal:<createPackage>');
    const argsValue = [JSON.stringify(payload)];

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
          resolve(response.data[0]);
          // Save the data to DB end
        } else {
          reject(
            new Error(
              `There was an unknown error while creating the package (${
                payload.packageId
              }).`,
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
          reject(
            new Error(
              'Something went wrong getting the package history. Please try again',
            ),
          );
        }
      }),
    );
  }

  async updateShipmentStatus(payload) {
    // logger.debug('Postal:<updateShipmentStatus>');

    const argsValue = [JSON.stringify(payload)];

    options.method_type = 'invoke';
    options.func = 'updateShipmentStatus';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, async (err, response) => {
        if (err) {
          logger.error(`Unable to update package in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
          logger.info(`Package (${response.data}) updated on blockchain.`);
          resolve(response.data);
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
  async updateDispatch(payload) {
    // logger.debug('Postal:<updateShipmentStatus>');

    const argsValue = [JSON.stringify(payload)];

    options.method_type = 'invoke';
    options.func = 'updateDispatch';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, async (err, response) => {
        if (err) {
          logger.error(`Unable to update dispatch in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
          logger.info(`Dispatch (${response.data}) updated on blockchain.`);
          resolve(response.data);
        } else {
          reject(
            new Error(
              `There was an unknown error while updating the dispatch (${
                response.data
              }).`,
            ),
          );
        }
      }),
    );
  }
  async updateReceptacle(payload) {
    // logger.debug('Postal:<updateShipmentStatus>');

    const argsValue = [JSON.stringify(payload)];

    options.method_type = 'invoke';
    options.func = 'updateReceptacle';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, async (err, response) => {
        if (err) {
          logger.error(`Unable to update receptacle in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
          logger.info(`receptacle (${response.data}) updated on blockchain.`);
          resolve(response.data);
        } else {
          reject(
            new Error(
              `There was an unknown error while updating the receptacle (${
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
          resolve(response.data);
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

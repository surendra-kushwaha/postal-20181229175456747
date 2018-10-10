import logger from '../logger';

const wss = {};
let enrollObj = null;

const {
  updateOnePackage,
  createPackage,
} = require('./postalPackageDataController');

const helper = require('../../utils/helper.js')(
  process.env.creds_filename,
  logger,
);
const fcw = require('../../utils/fc_wrangler/index.js')(
  { block_delay: helper.getBlockDelay() },
  logger,
);
const ws_server = require('../../utils/websocket_server_side.js')(
  { block_delay: helper.getBlockDelay() },
  fcw,
  logger,
);

const opts = helper.makeSharedAccumsLibOptions();

enroll_admin(1, e => {
  if (e == null) {
    setup_postalscm_lib();
  }
});

let postalscm_lib = require('../../utils/postalscm_cc_lib.js')(
  enrollObj,
  opts,
  fcw,
  logger,
);

ws_server.setup(wss.broadcast);

// logger.debug('Checking if chaincode is already deployed or not');
const channel = helper.getChannelId();
const first_peer = helper.getFirstPeerName(channel);

// logger.info(`first_peer::${first_peer}`);

const options = {
  peer_urls: [helper.getPeersUrl(first_peer)],
  args: {},
};

function setup_postalscm_lib() {
  const opts = helper.makeSharedAccumsLibOptions();
  postalscm_lib = require('../../utils/postalscm_cc_lib.js')(
    enrollObj,
    opts,
    fcw,
    logger,
  );
  ws_server.setup(wss.broadcast);

  // logger.debug('Checking if chaincode is already deployed or not');
  const channel = helper.getChannelId();
  const first_peer = helper.getFirstPeerName(channel);
  // logger.info(`first_peer::${first_peer}`);
}

// enroll an admin with the CA for this peer/channel
function enroll_admin(attempt, cb) {
  fcw.enroll(helper.makeEnrollmentOptions(0), (errCode, obj) => {
    if (errCode != null) {
      logger.error('could not enroll...');

      // --- Try Again ---  //
      if (attempt >= 2) {
        if (cb) cb(errCode);
      } else {
        try {
          enroll_admin(++attempt, cb);
        } catch (e) {
          logger.error('could not delete old kvs', e);
        }
      }
    } else {
      enrollObj = obj;
      if (cb) cb(null);
    }
  });
}

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
          const blockchainPackage = JSON.parse(response.data);

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
          logger.info(`Package (${response.data}) updated on blockchain.`);
          const updateConditions = { packageId: response.data };

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

          try {
            const response = await updateOnePackage(response.data, updateObj);
            logger.debug('package data saved successfully to mongodb');
            resolve(response);
          } catch (err) {
            logger.debug({ status: 'fails', data: error });
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

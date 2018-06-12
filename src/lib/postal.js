import logger from '../logger';

const wss = {};
let enrollObj = null;

const { PostalPackage } = require('../models/postalPackageData');

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
  // logger.info('hiaaaa');
  if (e == null) {
    // logger.info("hiaaaa###");
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
/* var options = {
peer_urls: [helper.getPeersUrl(0)],
}; */
const channel = helper.getChannelId();
const first_peer = helper.getFirstPeerName(channel);

// logger.info(`first_peer::${first_peer}`);

const options = {
  peer_urls: [helper.getPeersUrl(first_peer)],
  args: {
    // marble_owner: username,
    // owners_company: process.env.marble_company
  },
};

function setup_postalscm_lib() {
  // logger.debug('Setup postal scm Lib...');

  const opts = helper.makeSharedAccumsLibOptions();
  postalscm_lib = require('../../utils/postalscm_cc_lib.js')(
    enrollObj,
    opts,
    fcw,
    logger,
  );
  ws_server.setup(wss.broadcast);

  // logger.debug('Checking if chaincode is already deployed or not');
  /* var options = {
	peer_urls: [helper.getPeersUrl(0)],
}; */

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
    // logger.info('Postal:<createPackage>');
    // logger.debug('Payload received', payload);
    /* const factory = this.businessNetworkDefinition.getFactory();

    const packageConcept = factory.newConcept(workspace, 'Package');
    packageConcept.packageId = payload.packageId;
    packageConcept.dispatchId = payload.dispatchId;
    packageConcept.receptacleId = payload.receptacleId;
    packageConcept.weight = payload.weight;
    packageConcept.packageType = payload.packageType;
    packageConcept.shipmentStatus = payload.shipmentStatus;
    packageConcept.lastUpdated = payload.lastUpdated;
    packageConcept.settlementStatus = payload.settlementStatus;
*/

    const {
      packageId,
      weight,
      originCountry,
      destinationCountry,
      settlementStatus,
      shipmentStatus,
      packageType,
      originReceptacleId,
      dispatchId,
      lastUpdated,
    } = payload;

    const argsValue = [
      `{"PackageID":"${packageId}", "Weight":"${weight}" , "OriginCountry":"${originCountry}" , "DestinationCountry":"${destinationCountry}", "SettlementStatus":"${settlementStatus}" , "ShipmentStatus":"${shipmentStatus}", "OriginReceptacleID":"${originReceptacleId}",  "PackageType":"${packageType}", "DispatchID":"${dispatchId}" , "LastUpdated":"${lastUpdated}"}`,
    ];
    // const options = {
    //   peer_urls: peerUrls,
    //   method_type: 'invoke',
    //   func: 'createPostalPackage',
    //   args: argsValue,
    // };
    options.method_type = 'invoke';
    options.func = 'createPostalPackage';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, (err, response) => {
        logger.debug('callback from blockchain');
        if (err) {
          logger.error(`Unable to create package in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
          logger.debug({ status: 'success', data: response });
          const blockchainPackage = JSON.parse(response.data);
          // create today's date
          /* const todayTimestamp = new Date();
                              const today = `${todayTimestamp.getFullYear()}/${todayTimestamp.getMonth() +
                                1}/${todayTimestamp.getDate()}`; */
          const todateTimeStamp = new Date();
          let today = `${todateTimeStamp.getMonth() +
            1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;
          if (todateTimeStamp.getMonth() + 1 < 10) {
            today = `0${todateTimeStamp.getMonth() +
              1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;
          }
          // logger.info("response data111:::"+blockchainPackage.PackageID);
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
            // dateCreated: blockchainPackage.LastUpdated,
            dateCreated: today,
          };
          if (
            postalData.dispatchId === undefined ||
            postalData.dispatchId === ''
          ) {
            postalData.dispatchId = 'none';
          }
          /* logger.debug(
                                `PostalData to save in DB::${JSON.stringify(postalData)}`,
                              ); */
          const postal = new PostalPackage(postalData);
          postal.save((err, result) => {
            if (err) {
              logger.info(`Unable to save created package in database: ${err}`);
              reject(err);
            } else {
              logger.info('Create Package data saved successfully to mongodb');
              resolve(result);
              // logger.info({ status: 'success', data: result });
            }
          });
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
    logger.info('Postal:<getPackageHistory>');
    // const packageId=payload;
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
          reject('Something went wrong. Please try again');
        }
      }),
    );
  }

  async updateShipmentStatus(payload) {
    // logger.info('Postal:<updateShipmentStatus>');
    /* var packageId="EX103456792US";
            var settlementStatus="Reconciled1"
            updateShipmentTransaction.packageIDs = payload.packageIDs;
              updateShipmentTransaction.lastUpdated = payload.lastUpdated;
              updateShipmentTransaction.newShipmentStatus = payload.newShipmentStatus;

              o String [] packageIDs
             o ShipmentStatus [] newShipmentStatus
             o DateTime [] lastUpdated
             o SettlementStatus [] newSettlementStatus
             o String [] receptacleId optional
             o String [] dispatchId optional
            */
    const {
      packageId,
      shipmentStatus,
      originReceptacleId,
      dispatchId,
      lastUpdated,
    } = payload;

    const argsValue = [
      String(packageId),
      String(shipmentStatus),
      String(originReceptacleId),
      String(dispatchId),
      String(lastUpdated),
    ];
    // const options = {
    //   peer_urls: peerUrls,
    //   method_type: 'invoke',
    //   func: 'updateShipmentStatus',
    //   args: argsValue,
    // }
    options.method_type = 'invoke';
    options.func = 'updateShipmentStatus';
    options.args = argsValue;

    return new Promise((resolve, reject) =>
      postalscm_lib.call_chaincode(options, (err, response) => {
        if (err) {
          logger.error(`Unable to update package in blockchain: ${err}`);
          reject(err);
        } else if (!err) {
          logger.info(`Package (${response.data}) updated on blockchain.`);
          const updateConditions = { packageId: response.data };
          const date = new Date();

          const updateObj = {
            shipmentStatus,
            receptacleId: originReceptacleId,
            dispatchId,
            lastUpdated,
          };

          logger.debug(
            `Conditions for update: ${JSON.stringify(updateConditions)}`,
          );
          PostalPackage.findOneAndUpdate(
            updateConditions,
            updateObj,
            (errDb, result) => {
              if (errDb) {
                logger.error(
                  `Unable to save update to package in blockchain. ${errDb}`,
                );
                reject(errDb);
              } else {
                logger.debug('package data saved successfully to mongodb');
                resolve(result);
              }
            },
          );
        } else {
          reject(
            new Error(
              `There was an unknown error while updating the package (${
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
      postalscm_lib.call_chaincode(options, (err, response) => {
        if (err) {
          logger.debug({ status: 'error', data: [err, response] });
          reject(err);
        } else if (!err) {
          logger.debug({ status: 'success', data: response });
          const updateConditions = {
            packageId: response.data,
          };
          const updateObj = {
            settlementStatus, // should be response.shipmentStatus
            lastUpdated,
          };
          PostalPackage.findOneAndUpdate(updateConditions, updateObj, error => {
            if (error) {
              logger.debug({ status: 'fails', data: error });
              reject(error);
            } else {
              logger.debug('package data saved successfully to mongodb');
              resolve(response);
            }
          });
        } else {
          logger.debug({
            status: 'fail',
            data: { msg: 'Something went wrong. Please try again' },
          });
          reject();
        }
      }),
    );
  }
}

const postal = new Postal();

export default postal;

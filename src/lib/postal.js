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
  logger.info('hiaaaa');
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

logger.debug('Checking if chaincode is already deployed or not');
/* var options = {
peer_urls: [helper.getPeersUrl(0)],
}; */

const channel = helper.getChannelId();
const first_peer = helper.getFirstPeerName(channel);
logger.info(`first_peer::${first_peer}`);
const options = {
  peer_urls: [helper.getPeersUrl(first_peer)],
  args: {
    // marble_owner: username,
    // owners_company: process.env.marble_company
  },
};

function setup_postalscm_lib() {
  logger.debug('Setup postal scm Lib...');

  const opts = helper.makeSharedAccumsLibOptions();
  postalscm_lib = require('../../utils/postalscm_cc_lib.js')(
    enrollObj,
    opts,
    fcw,
    logger,
  );
  ws_server.setup(wss.broadcast);

  logger.debug('Checking if chaincode is already deployed or not');
  /* var options = {
	peer_urls: [helper.getPeersUrl(0)],
}; */

  const channel = helper.getChannelId();
  const first_peer = helper.getFirstPeerName(channel);
  logger.info(`first_peer::${first_peer}`);
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
    logger.info('Postal:<createPackage>');
    logger.debug('Payload received', payload);
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
    options.method_type = 'invoke';
    options.func = 'createPostalPackage';
    options.args = argsValue;
    postalscm_lib.call_chaincode(options, (err, response) => {
      logger.info('callback from blockchain');
      if (err) {
        logger.info({ status: 'error', data: [err, response] });
      } else if (!err) {
        logger.info({ status: 'success', data: response });
        const blockchainPackage = JSON.parse(response.data);
        // create today's date
        const todayTimestamp = new Date();
        const today = `${todayTimestamp.getFullYear()}/${todayTimestamp.getMonth() +
          1}/${todayTimestamp.getDate()}`;
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
        logger.info(`PostalData to save in DB::${JSON.stringify(postalData)}`);
        const postal = new PostalPackage(postalData);
        postal.save((err, result) => {
          if (err) {
            logger.info({ status: 'fails', data: err });
          } else {
            logger.info('package data saved successfully to mongodb');
            logger.info({ status: 'success', data: result });
          }
        });
        // Save the data to DB end
      } else {
        logger.info({
          status: 'fail',
          data: { msg: 'Something went wrong. Please try again' },
        });
      }
    });
  }

async getPackageHistory(packageId,res) {
	logger.info('Postal:<getPackageHistory>');
    //const packageId=payload;
    const argsValue = [packageId];
    options.method_type="query";
     options.func="getPackageHistory";
     options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err) {
          res.send({ "status": "success", "data": { "msg": response.parsed } });
        } else {
          res.send({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
  }

  async updateShipmentStatus(payload) {
    logger.info('Postal:<updateShipmentStatus>');
    logger.info('app.js - Process claim is calling');
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
      packageId,
      shipmentStatus,
      originReceptacleId,
      dispatchId,
      lastUpdated,
    ];
    options.method_type = 'invoke';
    options.func = 'updateShipmentStatus';
    options.args = argsValue;
    postalscm_lib.call_chaincode(options, (err, response) => {
      if (err) {
        logger.info({ status: 'error', data: [err, response] });
      } else if (!err) {
        logger.info({ status: 'success', data: response });
      } else {
        logger.info({
          status: 'fail',
          data: { msg: 'Something went wrong. Please try again' },
        });
      }
    });
  }

  async updateSettlementStatus(payload) {
    logger.info('Postal:<updateSettlementStatus>');
    logger.debug('Payload received:', payload);
    /* var packageId="EX103456792US";
	var settlementStatus="Reconciled1" */
    const packageId = payload.packageUUID;
    const settlementStatus = payload.newSettlementStatus;
    // var country="China";
    // var argsValue = ['{\"PostalId\":\"' + postalId + '\", \"Name\":\"' + name + '\" , \"Country\":\"' + country + '\"}'];
    const argsValue = [packageId, settlementStatus];
    options.method_type = 'invoke';
    options.func = 'updateSettlementStatus';
    options.args = argsValue;
    postalscm_lib.call_chaincode(options, (err, response) => {
      if (err) {
        logger.info({ status: 'error', data: [err, response] });
      } else if (!err) {
        logger.info({ status: 'success', data: response });
      } else {
        logger.info({
          status: 'fail',
          data: { msg: 'Something went wrong. Please try again' },
        });
      }
    });
  }
}

const postal = new Postal();

export default postal;

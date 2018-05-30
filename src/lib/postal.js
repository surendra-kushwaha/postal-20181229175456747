import { BusinessNetworkConnection } from 'composer-client';
//import winston from '../logger';
//import postal_lib from '../utils/postalscm_cc_lib';

var ws = require('ws');											//websocket module
var winston = require('winston');
var wss = {};
var enrollObj = null;
var logger = new (winston.Logger)({
	level: 'debug',
	transports: [
		new (winston.transports.Console)({ colorize: true }),
	]
});

var helper = require('../../utils/helper.js')(process.env.creds_filename, logger);
var fcw = require('../../utils/fc_wrangler/index.js')({ block_delay: helper.getBlockDelay() }, logger);
var ws_server = require('../../utils/websocket_server_side.js')({ block_delay: helper.getBlockDelay() }, fcw, logger);
var opts = helper.makeSharedAccumsLibOptions();

enroll_admin(1, function (e) {console.log("hiaaaa");
						if (e == null) {
							console.log("hiaaaa###");
							setup_postalscm_lib();
						}
					});

var postalscm_lib = require('../../utils/postalscm_cc_lib.js')(enrollObj, opts, fcw, logger);

ws_server.setup(wss.broadcast);

logger.debug('Checking if chaincode is already deployed or not');
/*var options = {
peer_urls: [helper.getPeersUrl(0)],
};*/

const channel = helper.getChannelId();
const first_peer = helper.getFirstPeerName(channel);
console.log("first_peer::"+first_peer);
var options = {
peer_urls: [helper.getPeersUrl(first_peer)],
args: {
  //marble_owner: username,
  //owners_company: process.env.marble_company
}
};

function setup_postalscm_lib() {
	logger.debug('Setup SharedAccums Lib...');

	var opts = helper.makeSharedAccumsLibOptions();
	postalscm_lib = require('../../utils/postalscm_cc_lib.js')(enrollObj, opts, fcw, logger);
	ws_server.setup(wss.broadcast);

	logger.debug('Checking if chaincode is already deployed or not');
	/*var options = {
	peer_urls: [helper.getPeersUrl(0)],
};*/

const channel = helper.getChannelId();
  const first_peer = helper.getFirstPeerName(channel);
  console.log("first_peer::"+first_peer);
  var options = {
    peer_urls: [helper.getPeersUrl(first_peer)],
    args: {
      //marble_owner: username,
      //owners_company: process.env.marble_company
    }
  };
}

	//enroll an admin with the CA for this peer/channel
  function enroll_admin(attempt, cb) {
    fcw.enroll(helper.makeEnrollmentOptions(0), function (errCode, obj) {
      if (errCode != null) {
        logger.error('could not enroll...');
  
        // --- Try Again ---  //
        if (attempt >= 2) {
          if (cb) cb(errCode);
        } else {
          try {
            logger.warn('removing older kvs and trying to enroll again');
            rmdir(makeKVSpath());				//delete old kvs folder
            logger.warn('removed older kvs');
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
  

const cardname = '';
const workspace = '';

class Postal {
  /**
   * Need to have the mapping from bizNetwork name to the URLs to connect to.
   * bizNetwork name will be able to be used by Composer to get the suitable model files.
   *
   */
  constructor() {
    this.bizNetworkConnection = new BusinessNetworkConnection();
  }

  /**
   * @description Initalizes the Postal by making a connection to the Composer runtime
   * @return {Promise} A promise whose fullfillment means the initialization has completed
   */
  async init() {
    this.businessNetworkDefinition = await this.bizNetworkConnection.connect(
      cardname,
    );
    winston.info(
      'Postal:<init>',
      'businessNetworkDefinition obtained',
      this.businessNetworkDefinition.getIdentifier(),
    );
    winston.info('Subscribing to events');
    this.bizNetworkConnection.on('event', evt => {
      winston.info('New ShipmentPackageEvent', evt);
      // eslint-disable-next-line no-unused-vars
      const options = {
        properties: { key: 'value' },
      };
    });
  }
  async createPackage(payload) {
    winston.info('Postal:<createPackage>');
    winston.debug('Payload received:', payload);
    /*const factory = this.businessNetworkDefinition.getFactory();

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

  var packageId=payload.packageId;
  var weight=payload.weight;
  var originCountry=payload.originCountry;
  var destinationCountry=payload.destinationCountry;
  var settlementStatus=payload.settlementStatus;
  var shipmentStatus=payload.shipmentStatus;
  var packageType=payload.packageType;
  var originReceptacleId=payload.receptacleId;
  var dispatchId=payload.dispatchId;
  var lastUpdated=payload.lastUpdated;
	//var subscriberId = req.body.subscriberID;
		//var argsValue=['{\"postalId\":\"China1\"}'];
  var argsValue = ['{\"PackageID\":\"' + packageId + '\", \"Weight\":\"' + weight + '\" , \"OriginCountry\":\"' + originCountry + '\" , \"DestinationCountry\":\"' + destinationCountry + '\", \"SettlementStatus\":\"' + settlementStatus + '\" , \"ShipmentStatus\":\"' + shipmentStatus + '\", \"OriginReceptacleID\":\"' + originReceptacleId + '\",  \"PackageType\":\"' + packageType + '\", \"DispatchID\":\"' + dispatchId + '\" , \"LastUpdated\":\"' + lastUpdated + '\"}'];
  options.method_type="invoke";
      options.func="createPostalPackage";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          console.log({ "status": "error", "data": [err,response] });
        } else if (!err) {
          console.log({ "status": "success", "data": response });
        } else {
          console.log({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
  }

  async updateShipmentStatus(payload) {
    winston.info('Postal:<updateShipmentStatus>');
    console.log("app.js - Process claim is calling");
	/*var packageId="EX103456792US";
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
 var packageId=payload.packageId;
 var shipmentStatus=payload.newShipmentStatus;
 var originReceptacleId=payload.receptacleId;
 var dispatchId=payload.dispatchId;
 var lastUpdated=payload.lastUpdated;

 var argsValue = [packageId,shipmentStatus,originReceptacleId,dispatchId];
   options.method_type="invoke";
     options.func="updateShipmentStatus";
     options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          console.log({ "status": "error", "data": [err,response] });
        } else if (!err) {
          console.log({ "status": "success", "data": response });
        } else {
          console.log({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
  }

  async updateSettlementStatus(payload) {
    winston.info('Postal:<updateSettlementStatus>');
    winston.debug('Payload received:', payload);
    /*var packageId="EX103456792US";
	var settlementStatus="Reconciled1"*/
  var packageId=payload.packageUUID;
  var settlementStatus=payload.newSettlementStatus;
	//var country="China";
	  //var argsValue = ['{\"PostalId\":\"' + postalId + '\", \"Name\":\"' + name + '\" , \"Country\":\"' + country + '\"}'];
	  var argsValue = [packageId,settlementStatus];
	  options.method_type="invoke";
      options.func="updateSettlementStatus";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          console.log({ "status": "error", "data": [err,response] });
        } else if (!err) {
          console.log({ "status": "success", "data": response });
        } else {
          console.log({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
  }
}

const postal = new Postal();
postal.init();

export default postal;

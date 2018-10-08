/* jshint node:true */

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server.
// for more info, see: http://expressjs.com
const express = require('express');

const https = require('https');

const querystring = require('querystring');

// cfenv provides access to your Cloud Foundry environment.
// for more info, see: https://www.npmjs.com/package/cfenv
const cfenv = require('cfenv');
// create a new express server
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
// serve the files out of ./public as our main files
app.use(express.static(`${__dirname}/public`));
// app.use(express.urlencoded());
app.set('view engine', 'jade');
app.set('views', `${__dirname}/views`); // optional since express defaults to CWD/views

const ws = require('ws'); // websocket module
const winston = require('winston');

const wss = {};
let enrollObj = null;
const logger = new winston.Logger({
  level: 'debug',
  transports: [new winston.transports.Console({ colorize: true })],
});

const helper = require(`${__dirname}/utils/helper.js`)(
  process.env.creds_filename,
  logger,
);
const fcw = require('./utils/fc_wrangler/index.js')(
  { block_delay: helper.getBlockDelay() },
  logger,
);
const ws_server = require('./utils/websocket_server_side.js')(
  { block_delay: helper.getBlockDelay() },
  fcw,
  logger,
);

const opts = helper.makeSharedAccumsLibOptions();

enroll_admin(1, e => {
  console.log('hiaaaa');
  if (e == null) {
    console.log('hiaaaa###');
    setup_postalscm_lib();
  }
});

postalscm_lib = require('./utils/postalscm_cc_lib.js')(
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
console.log(`first_peer::${first_peer}`);
const options = {
  peer_urls: [helper.getPeersUrl(first_peer)],
  args: {
    // marble_owner: username,
    // owners_company: process.env.marble_company
  },
};

function setup_postalscm_lib() {
  logger.debug('Setup SharedAccums Lib...');

  const opts = helper.makeSharedAccumsLibOptions();
  postalscm_lib = require('./utils/postalscm_cc_lib.js')(
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
  console.log(`first_peer::${first_peer}`);
  const options = {
    peer_urls: [helper.getPeersUrl(first_peer)],
    args: {
      // marble_owner: username,
      // owners_company: process.env.marble_company
    },
  };
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
          logger.warn('removing older kvs and trying to enroll again');
          rmdir(makeKVSpath()); // delete old kvs folder
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

// Rest Api for postal scm
app.post('/addPostal', (req, res) => {
  console.log('app.js - Process claim is calling');
  /* var postalId="China";
	var name="ChinaPost"
	var country="China"; */
  const postalId = req.body.postalId;
  const name = req.body.name;
  const country = req.body.country;

  const argsValue = [
    `{"PostalId":"${postalId}", "Name":"${name}" , "Country":"${country}"}`,
  ];
  console.log(`argsValue:::${argsValue}`);
  options.method_type = 'invoke';
  options.func = 'addPostal';
  options.args = argsValue;
  postalscm_lib.call_chaincode(options, (err, response) => {
    if (err) {
      res.send({ status: 'error', data: [err, response] });
    } else if (!err) {
      res.send({ status: 'success', data: response.parsed });
    } else {
      res.send({
        status: 'fail',
        data: { msg: 'Something went wrong. Please try again' },
      });
    }
  });
  // options.args=argsValue;

  /* options.args=["China","ChinaPost","China"];
		postalscm_lib.process_claim(options, function (err,resp) {

		console.log("Add Postal ::@@@::"+JSON.stringify(resp));
		}); */
});

app.get('/getPostal', (req, res) => {
  const postalId = req.query.postalId;
  options.method_type = 'query';
  options.func = 'queryPostal';
  // options.args=[query.userid + "_" + query.userType];
  options.args = [postalId];
  postalscm_lib.call_chaincode(options, (err, response) => {
    if (err) {
      res.send({ status: 'error', data: [err, response] });
    } else {
      res.send({ status: 'success', data: { msg: response.parsed } });
    }
  });
});

app.post('/createPostalPackage', (req, res) => {
  console.log('app.js - Process claim is calling');
  /* var packageId="EX103456792US";
	var weight="57"
	var originCountry="China";
	var destinationCountry="USA";
	var settlementStatus="Acceptance Scan"
	var shipmentStatus="Reconciled";
	var packageType="Express";
	var originReceptacleId="REC123456791US"
	var dispatchId="CNBJSAUSJFKAAUN81254";
	var lastUpdated="05/25/2018"; */
  const packageId = req.body.packageId;
  const weight = req.body.weight;
  const originCountry = req.body.originCountry;
  const destinationCountry = req.body.destinationCountry;
  const settlementStatus = req.body.settlementStatus;
  const shipmentStatus = req.body.shipmentStatus;
  const packageType = req.body.packageType;
  const originReceptacleId = req.body.originReceptacleId;
  const dispatchId = req.body.dispatchId;
  const lastUpdated = req.body.lastUpdated;
  // var subscriberId = req.body.subscriberID;
  // var argsValue=['{\"postalId\":\"China1\"}'];
  const argsValue = [
    `{"PackageID":"${packageId}", "Weight":"${weight}" , "OriginCountry":"${originCountry}" , "DestinationCountry":"${destinationCountry}", "SettlementStatus":"${settlementStatus}" , "ShipmentStatus":"${shipmentStatus}", "OriginReceptacleID":"${originReceptacleId}",  "PackageType":"${packageType}", "DispatchID":"${dispatchId}" , "LastUpdated":"${lastUpdated}"}`,
  ];
  options.method_type = 'invoke';
  options.func = 'createPostalPackage';
  options.args = argsValue;
  postalscm_lib.call_chaincode(options, (err, response) => {
    if (err) {
      res.send({ status: 'error', data: [err, response] });
    } else if (!err) {
      res.send({ status: 'success', data: response.parsed });
    } else {
      res.send({
        status: 'fail',
        data: { msg: 'Something went wrong. Please try again' },
      });
    }
  });
});

app.get('/getPostalPackage', (req, res) => {
  console.log('app.js - package details is calling');
  const packageId = req.query.packageId;
  options.method_type = 'query';
  options.func = 'queryPackage';
  // options.args=[query.userid + "_" + query.userType];
  // options.args=["EX103456792US"];
  options.args = [packageId];
  postalscm_lib.call_chaincode(options, (err, response) => {
    if (err) {
      res.send({ status: 'error', data: [err, response] });
    } else {
      res.send({ status: 'success', data: { msg: response.parsed } });
    }
  });
});

// Rest Api for postal scm
app.post('/updateSettlementStatus', (req, res) => {
  console.log('app.js - Process claim is calling');
  /* var packageId="EX103456792US";
	var settlementStatus="Reconciled1" */
  const packageId = req.body.packageId;
  const settlementStatus = req.body.settlementStatus;
  // var country="China";
  // var argsValue = ['{\"PostalId\":\"' + postalId + '\", \"Name\":\"' + name + '\" , \"Country\":\"' + country + '\"}'];
  const argsValue = [packageId, settlementStatus];
  options.method_type = 'invoke';
  options.func = 'updateSettlementStatus';
  options.args = argsValue;
  postalscm_lib.call_chaincode(options, (err, response) => {
    if (err) {
      res.send({ status: 'error', data: [err, response] });
    } else if (!err) {
      res.send({ status: 'success', data: response.parsed });
    } else {
      res.send({
        status: 'fail',
        data: { msg: 'Something went wrong. Please try again' },
      });
    }
  });
});

// Rest Api for postal scm
app.post('/updateShipmentStatus', (req, res) => {
  console.log('app.js - Process claim is calling');
  /* var packageId="EX103456792US";
	var shipmentStatus="Reconciled1";
	var originReceptacleId="REC123456791US";
	var dispatchId="CNBJSAUSJFKAAUN81254"; */
  const packageId = req.body.packageId;
  const shipmentStatus = req.body.shipmentStatus;
  const originReceptacleId = req.body.originReceptacleId;
  const dispatchId = req.body.dispatchId;

  const argsValue = [packageId, shipmentStatus, originReceptacleId, dispatchId];
  options.method_type = 'invoke';
  options.func = 'updateShipmentStatus';
  options.args = argsValue;
  postalscm_lib.call_chaincode(options, (err, response) => {
    if (err) {
      res.send({ status: 'error', data: [err, response] });
    } else if (!err) {
      res.send({ status: 'success', data: response.parsed });
    } else {
      res.send({
        status: 'fail',
        data: { msg: 'Something went wrong. Please try again' },
      });
    }
  });
});

/*
app.post('/addUser', function(req, res) {
  var argsValue = ['{\"UserID\":\"user1\", \"FirstName\":\"fname\" , \"LastName\":\"lname\" , \"SmartMeterID\":\"123\", \"UserType\":\"Prosumer\"}'];
    options.method_type="invoke";
      options.func="AddUser";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err) {
          res.send({ "status": "success", "data": response.parsed });
        } else {
          res.send({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      }
    );
})

app.get('/getUser', function(req, res) {
  options.method_type="query";
      options.func="GetUser";
      //options.args=[query.userid + "_" + query.userType];
      options.args=["user1_Prosumer"];
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err && response.statusCode == 200 ) {
          res.send({ "status": "success", "data": response.body });
        } else {
          res.send({ "status": "fail", "data": { "msg": response.parsed } });
        }
      }
    );
})

*/

// get the app environment from Cloud Foundry
const appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, () => {
  // print a message when the server starts listening
  console.log(`server starting on ${appEnv.url}`);
});

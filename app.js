/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');

var https = require('https');

var querystring = require('querystring');

// cfenv provides access to your Cloud Foundry environment.
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// create a new express server
var app = express();
var bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
// app.use(express.urlencoded());
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

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


var misc = require('./utils/misc.js')(logger);												// mis.js has generic (non-blockchain) related functions
misc.check_creds_for_valid_json();
var helper = require(__dirname + '/utils/connection_profile_lib/index.js')(process.env.creds_filename, logger);	// parses our cp file/data

//var helper = require(__dirname + '/utils/helper.js')(process.env.creds_filename, logger);
var fcw = require('./utils/fc_wrangler/index.js')({ block_delay: helper.getBlockDelay() }, logger);
var ws_server = require('./utils/websocket_server_side.js')({ block_delay: helper.getBlockDelay() }, fcw, logger);
var opts = helper.makeSharedAccumsLibOptions();

enroll_admin(1, function (e) {console.log("hiaaaa");
						if (e == null) {
							console.log("hiaaaa###");
							setup_postalscm_lib();
						}
					});



postalscm_lib = require('./utils/postalscm_cc_lib.js')(enrollObj, opts, fcw, logger);
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
	postalscm_lib = require('./utils/postalscm_cc_lib.js')(enrollObj, opts, fcw, logger);
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

//Rest Api for postal scm
app.post('/addPostal', function(req, res) {
	console.log("app.js - Process claim is calling");
	/*var postalId="China";
	var name="ChinaPost"
	var country="China";*/
  var postalId=req.body.postalId;
  var name=req.body.name;
  var country=req.body.country;

		var argsValue = ['{\"PostalId\":\"' + postalId + '\", \"Name\":\"' + name + '\" , \"Country\":\"' + country + '\"}'];
    console.log("argsValue:::"+argsValue)
		options.method_type="invoke";
      options.func="addPostal";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err) {
          res.send({ "status": "success", "data": response.parsed });
        } else {
          res.send({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
    	//options.args=argsValue;

		/*options.args=["China","ChinaPost","China"];
		postalscm_lib.process_claim(options, function (err,resp) {

		console.log("Add Postal ::@@@::"+JSON.stringify(resp));
		});*/

})

app.get('/getPostal', function(req, res) {
      var postalId=req.query.postalId;
	    options.method_type="query";
      options.func="queryPostal";
      //options.args=[query.userid + "_" + query.userType];
      options.args=[postalId];
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else {
          res.send({ "status": "success", "data": { "msg": response.parsed } });
        }
      }
    );
})

app.post('/createPostalPackage', function(req, res) {
	console.log("app.js - Process claim is calling");
	/*var packageId="EX103456792US";
	var weight="57"
	var originCountry="China";
	var destinationCountry="USA";
	var settlementStatus="Acceptance Scan"
	var shipmentStatus="Reconciled";
	var packageType="Express";
	var originReceptacleId="REC123456791US"
	var dispatchId="CNBJSAUSJFKAAUN81254";
	var lastUpdated="05/25/2018";*/
  var packageId=req.body.packageId;
  var weight=req.body.weight;
  var originCountry=req.body.originCountry;
  var destinationCountry=req.body.destinationCountry;
  var settlementStatus=req.body.settlementStatus;
  var shipmentStatus=req.body.shipmentStatus;
  var packageType=req.body.packageType;
  var originReceptacleId=req.body.originReceptacleId;
  var dispatchId=req.body.dispatchId;
  var lastUpdated=req.body.lastUpdated;
	//var subscriberId = req.body.subscriberID;
		//var argsValue=['{\"postalId\":\"China1\"}'];
  var argsValue = ['{\"PackageID\":\"' + packageId + '\", \"Weight\":\"' + weight + '\" , \"OriginCountry\":\"' + originCountry + '\" , \"DestinationCountry\":\"' + destinationCountry + '\", \"SettlementStatus\":\"' + settlementStatus + '\" , \"ShipmentStatus\":\"' + shipmentStatus + '\", \"OriginReceptacleID\":\"' + originReceptacleId + '\",  \"PackageType\":\"' + packageType + '\", \"DispatchID\":\"' + dispatchId + '\" , \"LastUpdated\":\"' + lastUpdated + '\"}'];
  options.method_type="invoke";
      options.func="createPostalPackage";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err) {
          res.send({ "status": "success", "data": response.parsed });
        } else {
          res.send({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });

})


app.get('/getPostalPackage', function(req, res) {
	console.log("app.js - package details is calling");
     var packageId=req.query.packageId;
	   options.method_type="query";
      options.func="queryPackage";
      //options.args=[query.userid + "_" + query.userType];
      //options.args=["EX103456792US"];
      options.args=[packageId];
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else {
          res.send({ "status": "success", "data": { "msg": response.parsed } });
        }
      }
    );

})

//Rest Api for postal scm
app.post('/updateSettlementStatus', function(req, res) {
	console.log("app.js - Process claim is calling");
	/*var packageId="EX103456792US";
	var settlementStatus="Reconciled1"*/
  var packageId=req.body.packageId;
  var settlementStatus=req.body.settlementStatus;
	//var country="China";
	  //var argsValue = ['{\"PostalId\":\"' + postalId + '\", \"Name\":\"' + name + '\" , \"Country\":\"' + country + '\"}'];
	  var argsValue = [packageId,settlementStatus];
	  options.method_type="invoke";
      options.func="updateSettlementStatus";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err) {
          res.send({ "status": "success", "data": response.parsed });
        } else {
          res.send({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
})

//Rest Api for postal scm
app.post('/updateShipmentStatus', function(req, res) {
	console.log("app.js - Process claim is calling");
	/*var packageId="EX103456792US";
	var shipmentStatus="Reconciled1";
	var originReceptacleId="REC123456791US";
	var dispatchId="CNBJSAUSJFKAAUN81254";*/
  var packageId=req.body.packageId;
  var shipmentStatus=req.body.shipmentStatus;
  var originReceptacleId=req.body.originReceptacleId;
  var dispatchId=req.body.dispatchId;

	var argsValue = [packageId,shipmentStatus,originReceptacleId,dispatchId];
	  options.method_type="invoke";
      options.func="updateShipmentStatus";
      options.args=argsValue;
      postalscm_lib.call_chaincode(options,function (err, response) {
        if (err) {
          res.send({ "status": "error", "data": [err,response] });
        } else if (!err) {
          res.send({ "status": "success", "data": response.parsed });
        } else {
          res.send({ "status": "fail", "data": { "msg": "Something went wrong. Please try again" } });
        }
      });
})

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
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

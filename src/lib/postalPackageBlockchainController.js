import logger from '../logger';

const wss = {};
let enrollObj = null;

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
export { postalscm_lib, options };

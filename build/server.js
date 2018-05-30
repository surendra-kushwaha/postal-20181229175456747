require('source-map-support').install(); 'use strict';


var _app = require('./app');var _app2 = _interopRequireDefault(_app);
var _config = require('./config');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// Launch Node.js server
/* eslint-disable no-console, no-shadow */const server = _app2.default.listen(_config2.default.port, _config2.default.host, () => {
  console.log(
  `Node.js server is listening on http://${_config2.default.host}:${_config2.default.port}/`);

});

// Shutdown Node.js app gracefully
function handleExit(options, err) {
  if (options.cleanup) {
    const actions = [server.close];
    actions.forEach((close, i) => {
      try {
        close(() => {
          if (i === actions.length - 1) process.exit();
        });
      } catch (err) {
        if (i === actions.length - 1) process.exit();
      }
    });
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

process.on('exit', handleExit.bind(null, { cleanup: true }));
process.on('SIGINT', handleExit.bind(null, { exit: true }));
process.on('SIGTERM', handleExit.bind(null, { exit: true }));
process.on('uncaughtException', handleExit.bind(null, { exit: true }));
//# sourceMappingURL=server.js.map

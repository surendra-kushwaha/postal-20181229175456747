'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _logger = require('../../../logger');var _logger2 = _interopRequireDefault(_logger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const login = (req, res) => {
  _logger2.default.info('Entered login');
  const data = {
    name: req.body.credentials.user_name };

  res.json(data);
};exports.default =

login;
//# sourceMappingURL=index.js.map

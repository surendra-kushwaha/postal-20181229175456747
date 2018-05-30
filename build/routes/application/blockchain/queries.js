'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.packageHistory = exports.updatePackageSettlement = exports.updateDispatchSettlement = undefined;var _logger = require('../../../logger');var _logger2 = _interopRequireDefault(_logger);
var _postal = require('../../../lib/postal');var _postal2 = _interopRequireDefault(_postal);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const { PostalPackage } = require('../../../models/postalPackageData');

const updateDispatchSettlement = (req, res) => {
  _logger2.default.trace('Entered updateDispatchSettlement');
  res.status(200).json('');
};

const updatePackageSettlement = (req, res) => {
  _logger2.default.trace('Entered updatePackageSettlement');
  // Connect to local database (PostalPackage) and grab packageUUID by using parameters given in swagger (packageId)
  PostalPackage.find({}, 'packageUUID', async (err, data) => {
    // add query parameters from front end
    if (err) {
      res.send(400);
    } else {
      // pass packageUUID and newSettlementStatus to postal
      const payload = {
        packageId: data,
        newSettlementStatus: req.body.newStatus };
      // need to add transformation logic
      await _postal2.default.updateSettlementStatus(payload);
      // once call to postal is complete grab updated package from database and send to front end
      PostalPackage.find({ data }, (error, newData) => {
        if (error) {
          res.send(400);
        } else {
          res.status(200).json({ newData }); // need to add returned data transformation logic
        }
      });
    }
  });
};

const packageHistory = async (req, res) => {
  _logger2.default.trace('Entered packageHistory');
  const history = await _postal2.default.getPackageHistory(req.query.packageId);
  // may need to do some transformations on history
  res.status(200).json(history);
};exports.

updateDispatchSettlement = updateDispatchSettlement;exports.updatePackageSettlement = updatePackageSettlement;exports.packageHistory = packageHistory;
//# sourceMappingURL=queries.js.map

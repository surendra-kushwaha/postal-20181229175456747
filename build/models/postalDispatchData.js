'use strict';var _mongoose = require('mongoose');var _mongoose2 = _interopRequireDefault(_mongoose);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const PostalDispatchSchema = new _mongoose2.default.Schema(
{
  dispatchId: {
    type: String },

  originPost: {
    type: String },

  destinationPost: {
    type: String },

  packageType: {
    type: String },

  totalReconciledWeight: {
    type: Number,
    default: 0 },

  totalReconciledPackages: {
    type: Number,
    default: 0 },

  totalUnreconciledWeight: {
    type: Number,
    default: 0 },

  totalUnreconciledPackages: {
    type: Number,
    default: 0 },

  settlementStatus: {
    type: String },

  startDate: {
    type: Date },

  endDate: {
    type: Date },

  dateCreated: {
    type: Date } },


{ collection: 'postal-dispatch-data' });


const PostalDispatch = _mongoose2.default.model('PostalDispatch', PostalDispatchSchema);
module.exports = { PostalDispatch };
//# sourceMappingURL=postalDispatchData.js.map

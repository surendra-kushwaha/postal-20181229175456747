'use strict';var _mongoose = require('mongoose');var _mongoose2 = _interopRequireDefault(_mongoose);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const PostalSchema = new _mongoose2.default.Schema(
{
  dispatchId: {
    type: String },

  packageId: {
    type: String },

  receptacleId: {
    type: String },

  packageUUID: {
    type: String },

  originPost: {
    type: String },

  destinationPost: {
    type: String },

  packageType: {
    type: String },

  weight: {
    type: Number,
    default: 0 },

  settlementStatus: {
    type: String },

  shipmentStatus: {
    type: String },

  startDate: {
    type: Date },

  endDate: {
    type: Date },

  dateCreated: {
    type: Date },

  lastUpdated: {
    type: Date } },


{ collection: 'postaldata' });


const PostalPackage = _mongoose2.default.model('PostalPackage', PostalSchema);
module.exports = { PostalPackage };
//# sourceMappingURL=postalPackageData.js.map

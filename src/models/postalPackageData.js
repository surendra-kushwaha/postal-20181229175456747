import mongoose from 'mongoose';

const PostalSchema = new mongoose.Schema(
  {
    dispatchId: {
      type: String,
    },
    packageId: {
      type: String,
    },
    receptacleId: {
      type: String,
    },
    packageUUID: {
      type: String,
    },
    originPost: {
      type: String,
    },
    destinationPost: {
      type: String,
    },
    packageType: {
      type: String,
    },
    weight: {
      type: Number,
      default: 0,
    },
    settlementStatus: {
      type: String,
    },
    shipmentStatus: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    dateCreated: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
    },
  },
  { collection: 'postaldata' },
);

const PostalPackage = mongoose.model('PostalPackage', PostalSchema);
module.exports = { PostalPackage };

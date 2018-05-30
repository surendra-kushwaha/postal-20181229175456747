import mongoose from 'mongoose';

const PostalDispatchSchema = new mongoose.Schema(
  {
    dispatchId: {
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
    totalReconciledWeight: {
      type: Number,
      default: 0,
    },
    totalReconciledPackages: {
      type: Number,
      default: 0,
    },
    totalUnreconciledWeight: {
      type: Number,
      default: 0,
    },
    totalUnreconciledPackages: {
      type: Number,
      default: 0,
    },
    settlementStatus: {
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
  },
  { collection: 'postal-dispatch-data' },
);

const PostalDispatch = mongoose.model('PostalDispatch', PostalDispatchSchema);
module.exports = { PostalDispatch };

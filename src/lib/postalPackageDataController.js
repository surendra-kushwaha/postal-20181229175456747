import logger from '../logger';

const { PostalPackage } = require('../models/postalPackageData');
/**
 *
 * @param {*} payload should follow the schema created in src/models/postalPackageData
 */

const createPackage = async (payload: Object) => {
  logger.debug('Creating package in mongodb');
  return new Promise((resolve, reject) => {
    const postal = new PostalPackage(payload);
    postal.save((err, result) => {
      if (err) {
        logger.error(`Unable to save created package in database: ${err}`);
        reject(err);
      } else {
        logger.debug('Package data saved successfully to mongodb');
        resolve(result);
      }
    });
  });
};

/**
 * @param packageId : packageId from EDI message that identifies package
 * @param updatedPackage : one or many of the fields defined in src/models/postalPackageData
 *                         that are to be updated
 */
const updateOnePackage = async (packageId: String, updatedPackage: Object) => {
  const updateConditions = { packageId };
  logger.debug(`Conditions for update: ${JSON.stringify(updateConditions)}`);
  return new Promise((resolve, reject) => {
    PostalPackage.findOneAndUpdate(
      updateConditions,
      updatedPackage,
      (err, result) => {
        if (err) {
          logger.error(`Unable to save update to package in mongoDb. ${err}`);
          reject(err);
        } else {
          logger.debug('Package update saved successfully to mongodb');
          resolve(result);
        }
      },
    );
  });
};

/**
 * @param packageId : packageId from EDI message that identifies package
 */
const findOnePackage = async (packageId: String) => {
  const findConditions = { packageId };
  logger.debug(`Looking for package: ${JSON.stringify(findConditions)}`);
  return new Promise((resolve, reject) => {
    PostalPackage.find(findConditions, (err, result) => {
      if (err) {
        logger.error(`Unable to save update to package in mongoDb. ${err}`);
        reject(err);
      } else {
        logger.debug(`Found package (${packageId}) successfully`);
        resolve(result);
      }
    });
  });
};

/**
 * @param queryObj : queryObj that defines the packages to read from database
 *
 * Examples:
 * {
 *   dispatchId: 'exampleDispatchId',
 * }
 *
 * {
 *   originPost: 'US',
 *   destinationPost: 'CN',
 *   packageType: 'EX',
 * }
 */
const findPackages = async (queryObj: Object, queryString: String) => {
  const findConditions = queryObj;
  logger.debug(`Looking for package: ${JSON.stringify(findConditions)}`);
  // if (queryString === undefined) queryString = '';
  return new Promise((resolve, reject) => {
    PostalPackage.find(findConditions, queryString, (err, result) => {
      if (err) {
        logger.error(`Unable to save update to package in mongoDb. ${err}`);
        reject(err);
      } else {
        logger.debug(`Found package (${queryObj}) successfully`);
        resolve(result);
      }
    });
  });
};

const removePackages = async removeCondition =>
  new Promise((resolve, reject) => {
    PostalPackage.remove(removeCondition, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

export {
  createPackage,
  updateOnePackage,
  findOnePackage,
  findPackages,
  removePackages,
};

/* @flow */

import logger from '../../logger';

class PostalPackage {
  constructor(data) {
    logger.info('Constructing mock PostalPackage');
    this.data = data;
  }
  async save(cb) {
    cb(undefined, this.data);
  }
  static findOneAndUpdate(updateConditions, updateObject, cb) {
    const response = {
      updateConditions,
      updateObject,
    };
    if (
      updateConditions.packageId === 'package1' ||
      updateConditions.packageId === 'package2' ||
      updateConditions.packageId === 'package3' ||
      updateConditions.packageId === 'package4'
    ) {
      PostalPackage.packages.forEach(pac => {
        if (pac.packageId === updateConditions.packageId)
          pac.settlementStatus = updateObject.settlementStatus;
      });
    }
    if (updateConditions.packageId === 'testPackageId123')
      cb(undefined, response);
    else if (updateConditions.packageId === 'queriestest1')
      cb(undefined, { data: updateConditions.packageId });
    else cb(undefined, response);
  }
  static find(findCondition: Object, queryString?: String, cb) {
    if (findCondition.packageId) {
      const response = {
        packageId: findCondition.packageId,
      };
      cb(undefined, [response]);
    } else if (PostalPackage.noneArray.includes(findCondition.dispatchId)) {
      const response = PostalPackage.packages.filter(
        pac =>
          pac.dispatchId === findCondition.dispatchId &&
          pac.originPost === findCondition.originPost &&
          pac.destinationPost === findCondition.destinationPost &&
          pac.startDate === findCondition.startDate &&
          pac.endDate === findCondition.endDate &&
          pac.packageType === findCondition.packageType &&
          pac.dateCreated === findCondition.dateCreated,
      );
      logger.debug(`RESPONSE:${JSON.stringify(response)}`);
      cb(undefined, response);
    } else if (findCondition.dispatchId) {
      const response = PostalPackage.packages.filter(
        pac => pac.dispatchId === findCondition.dispatchId,
      );
      logger.debug(`RESPONSE:${JSON.stringify(response)}`);
      cb(undefined, response);
    }
  }
}

const todateTimeStamp = new Date();
const today =
  todateTimeStamp.getMonth() + 1 < 10
    ? `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

const startDate =
  new Date('01/01/2018').getMonth() + 1 < 10
    ? `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

const endDate =
  new Date('20/01/2018').getMonth() + 1 < 10
    ? `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

PostalPackage.noneArray = [
  undefined,
  '""',
  'none',
  'NONE',
  '"none"',
  '"NONE"',
  '',
];

PostalPackage.packages = [
  {
    dispatchId: 'dispatch1',
    packageId: 'package1',
    settlementStatus: 'Settlement Disputed',
    originPost: 'US',
    destinationPost: 'CN',
    startDate,
    endDate,
    dateCreated: today,
    packageType: 'test',
  },
  {
    dispatchId: '',
    packageId: 'package2',
    settlementStatus: 'Settlement Requested',
    originPost: 'US',
    destinationPost: 'CN',
    startDate,
    endDate,
    dateCreated: today,
    packageType: 'test',
  },
  {
    dispatchId: 'dispatch1',
    packageId: 'package3',
    settlementStatus: 'Settlement Agreed',
    originPost: 'US',
    destinationPost: 'CN',
    startDate,
    endDate,
    dateCreated: today,
    packageType: 'test',
  },
  {
    dispatchId: 'dispatch1',
    packageId: 'package4',
    settlementStatus: 'Dispute Confirmed',
    originPost: 'US',
    destinationPost: 'CN',
    startDate,
    endDate,
    dateCreated: today,
    packageType: 'test',
  },
];

module.exports = { PostalPackage };

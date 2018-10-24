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
    try {
      if (
        updateConditions === undefined ||
        updateConditions === null ||
        updateObject === undefined ||
        updateObject === null
      )
        throw Error;
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

      if (updateConditions.packageId === 'queriestest1')
        cb(undefined, {
          data: updateConditions.packageId,
        });
      else cb(undefined, response);
    } catch (err) {
      cb(err, undefined);
    }
  }
  static find(findCondition: Object, queryString?: String, cb) {
    try {
      logger.debug(`findCondition:${findCondition}`);
      if ('packageId' in findCondition) {
        const response = {
          packageId: findCondition.packageId,
        };
        cb(undefined, [response]);
      } else if ('dispatchId' in findCondition) {
        if (PostalPackage.noneArray.includes(findCondition.dispatchId)) {
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
        } else {
          const response = PostalPackage.packages.filter(
            pac => pac.dispatchId === findCondition.dispatchId,
          );
          logger.debug(`RESPONSE:${JSON.stringify(response)}`);
          cb(undefined, response);
        }
      } else if ('$or' in findCondition) {
        const response = PostalPackage.packages.filter(
          pac =>
            pac.originPost === findCondition.$or[0].originPost ||
            pac.destinationPost === findCondition.$or[1].destinationPost,
        );
        const updatedResponse = response.map(res => ({
          startDate: res.startDate,
          endDate: res.endDate,
          dateCreated: res.dateCreated,
          originPost: res.originPost,
          destinationPost: res.destinationPost,
        }));
        logger.debug(`RESPONSE:${JSON.stringify(updatedResponse)}`);
        cb(undefined, updatedResponse);
      } else if (
        !('dispatchId' in findCondition) &&
        !('packageId' in findCondition)
      ) {
        const response = PostalPackage.packages.filter(
          pac =>
            pac.originPost === findCondition.originPost &&
            pac.destinationPost === findCondition.destinationPost &&
            pac.startDate === findCondition.startDate &&
            pac.endDate === findCondition.endDate &&
            pac.dateCreated === findCondition.dateCreated,
        );
        logger.debug(`RESPONSE:${JSON.stringify(response)}`);
        cb(undefined, response);
      }
    } catch (err) {
      cb(err, undefined);
    }
  }

  static clearMockedDatabase() {
    logger.debug(`INSIDE CLEAR`);
    PostalPackage.packages[0].settlementStatus = 'Settlement Disputed';
    PostalPackage.packages[1].settlementStatus = 'Settlement Requested';
    PostalPackage.packages[2].settlementStatus = 'Settlement Agreed';
    PostalPackage.packages[3].settlementStatus = 'Dispute Confirmed';
  }
}

const todateTimeStamp = new Date();
const startdateTimeStamp = new Date('01/01/2018');
const enddateTimeStamp = new Date('01/20/2018');
const today =
  todateTimeStamp.getMonth() + 1 < 10
    ? `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

const startDate =
  new Date('01/01/2018').getMonth() + 1 < 10
    ? `0${startdateTimeStamp.getMonth() +
        1}/${startdateTimeStamp.getDate()}/${startdateTimeStamp.getFullYear()}`
    : `${startdateTimeStamp.getMonth() +
        1}/${startdateTimeStamp.getDate()}/${startdateTimeStamp.getFullYear()}`;

const endDate =
  new Date('20/01/2018').getMonth() + 1 < 10
    ? `0${enddateTimeStamp.getMonth() +
        1}/${enddateTimeStamp.getDate()}/${enddateTimeStamp.getFullYear()}`
    : `${enddateTimeStamp.getMonth() +
        1}/${enddateTimeStamp.getDate()}/${enddateTimeStamp.getFullYear()}`;

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
    weight: 1,
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
    weight: 2,
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
    weight: 3,
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
    weight: 4,
    startDate,
    endDate,
    dateCreated: today,
    packageType: 'test',
  },
];

module.exports = { PostalPackage };

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
    cb(undefined, response);
  }
}

module.exports = { PostalPackage };

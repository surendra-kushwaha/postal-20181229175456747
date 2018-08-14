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
}

module.exports = { PostalPackage };

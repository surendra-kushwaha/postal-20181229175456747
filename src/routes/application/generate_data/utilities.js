/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
import logger from '../../../logger';
import postal from '../../../lib/postalUpdated';

const _ = require('lodash');

// eslint-disable-next-line func-names
Promise.settle = function(promises) {
  return Promise.all(
    promises.map(p =>
      // make sure any values or foreign promises are wrapped in a promise
      Promise.resolve(p).catch(err => {
        // make sure error is wrapped in Error object so we can reliably detect which promises rejected
        if (err instanceof Error) {
          return err;
        }
        const errObject = new Error();
        errObject.rejectErr = err;
        return errObject;
      }),
    ),
  );
};

const extractPackageData = req => {
  /*   
 
 ** WE CAN USE LODASH GROUPBY METHOD ALSO TO GROUP USING SHIPMENT STATUS **


 const grouped = _.mapValues(_.groupBy(req,'shipmentStatus'), plist =>
      plist.map(pack => {
        pack.packageType = pack.packageId.substr(0, 2);
        pack.origin = pack.packageId.slice(-2);
        pack.dispatchId = pack.receptacleId.substr(0, 20);
        pack.weight = pack.netReceptacleWeight;
        pack.dateCreated = new Date(pack.timestamp);
        pack.lastUpdated = new Date();
        return pack;
      }),
    );
    */

  const createPackage = [];
  const updateShipmentStatus = [];
  const updateDispatch = [];
  const updateReceptacle = [];
  req.forEach(pack => {
    if (pack.shipmentStatus === 'EMA') {
      pack.packageType = pack.packageId.substr(0, 2);
      pack.origin = pack.packageId.slice(-2);
      pack.dispatchId = pack.receptacleId.substr(0, 20);
      pack.weight = pack.netReceptacleWeight;
      pack.dateCreated = new Date(pack.timestamp);
      pack.lastUpdated = new Date();
      pack = _.omit(pack, [
        'netReceptacleWeight',
        'grossReceptacleWeight',
        'receptacleId',
        'timestamp',
        'dispatchId',
        'shipmentStatus',
      ]);
      createPackage.push(pack);
    } else if (
      pack.shipmentStatus === 'EMC' ||
      pack.shipmentStatus === 'PREDES'
    ) {
      let payload = {
        packageId: pack.packageId,
        newReceptacleId: pack.receptacleId,
        newReceptacleNetWeight: pack.netReceptacleWeight,
        newReceptacleGrossWeight: pack.grossReceptacleWeight,
      };
      updateReceptacle.push(payload);
      payload = {
        packageId: pack.packageId,
        newDispatchId: pack.receptacleId.substr(0, 20),
      };
      updateDispatch.push(payload);
      payload = {
        packageId: pack.packageId,
        newShipmentStatus: pack.shipmentStatus,
        lastUpdated: new Date(),
      };
      updateShipmentStatus.push(payload);
    } else {
      const payload = {
        packageId: pack.packageId,
        newShipmentStatus: pack.shipmentStatus,
        lastUpdated: new Date(),
      };
      updateShipmentStatus.push(payload);
    }
  });
  // eslint-disable-next-line no-underscore-dangle
  return _({
    updateDispatch,
    updateReceptacle,
    updateShipmentStatus,
    createPackage,
  }).omitBy(_.isEmpty).__wrapped__;
};

const updateAllPackages = payload => {
  const promises = [];

  _.forOwn(payload, (value, key) => {
    logger.debug(`Calling ${key} method`);
    if (key === 'createPackage') promises.push(postal.createPackage(value));
    else if (key === 'updateReceptacle')
      promises.push(postal.updateReceptacle(value));
    else if (key === 'updateShipmentStatus')
      promises.push(postal.updateShipmentStatus(value));
    else promises.push(postal.updateDispatch(value));
  });
  return Promise.settle(promises);
};

export { extractPackageData, updateAllPackages };

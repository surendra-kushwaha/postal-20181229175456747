/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
import logger from '../../../logger';
import postal from '../../../lib/postalUpdated';

const config = require('../../../../config/blockchain_creds1.json');

const _ = require('lodash');

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
  const updateSettlementStatus = [];
  // const updateDispatch = [];
  const updateReceptacleAndDispatch = [];
  let payload = {};
  req.forEach(pack => {
    payload = {};
    if (config.eventCodes.create_package.includes(pack.shipmentStatus)) {
      pack.packageType = pack.packageId.substr(0, 2);
      pack.origin = pack.packageId.slice(-2);
      pack.dispatchId = pack.receptacleId.substr(0, 20);
      pack.weight = pack.netReceptacleWeight;
      pack.dateCreated = new Date(pack.timestamp);
      pack.lastUpdated = new Date(pack.timestamp);
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
      config.eventCodes.update_recep_dispatch.includes(pack.shipmentStatus)
    ) {
      payload = {
        packageId: pack.packageId,
        newReceptacleId: pack.receptacleId,
        newReceptacleNetWeight: pack.netReceptacleWeight,
        newReceptacleGrossWeight: pack.grossReceptacleWeight,
        newDispatchId: pack.receptacleId.substr(0, 20),
      };
      updateReceptacleAndDispatch.push(payload);
      // payload = {
      //   packageId: pack.packageId,
      //   newDispatchId: pack.receptacleId.substr(0, 20),
      // };
      // updateDispatch.push(payload);
      payload = {
        packageId: pack.packageId,
        newShipmentStatus: pack.shipmentStatus,
        lastUpdated: new Date(pack.timestamp),
      };
      updateShipmentStatus.push(payload);
    } else {
      payload = {
        packageId: pack.packageId,
        newShipmentStatus: pack.shipmentStatus,
        lastUpdated: new Date(pack.timestamp),
      };
      updateShipmentStatus.push(payload);
    }
    if (config.eventCodes.reconciled.includes(pack.shipmentStatus)) {
      payload = {
        packageId: pack.packageId,
        newSettlementStatus: 'Reconciled',
        lastUpdated: new Date(pack.timestamp),
      };
    } else {
      payload = {
        packageId: pack.packageId,
        newSettlementStatus: 'Unreconciled',
        lastUpdated: new Date(pack.timestamp),
      };
    }
    updateSettlementStatus.push(payload);
  });
  // eslint-disable-next-line no-underscore-dangle
  return _({
    // updateDispatch,
    updateReceptacleAndDispatch,
    updateShipmentStatus,
    createPackage,
    updateSettlementStatus,
  }).omitBy(_.isEmpty).__wrapped__;
};

const updateAllPackages = async payload => {
  _.forOwn(payload, async (value, key) => {
    logger.debug(`Calling ${key} method`);
    if (key === 'createPackage') await postal.createPackage(value);
    else if (key === 'updateReceptacleAndDispatch')
      await postal.updateReceptacle(value);
    else if (key === 'updateShipmentStatus')
      await postal.updateShipmentStatus(value);
    else if (key === 'updateSettlementStatus')
      await postal.updateSettlementStatus(value);
  });
};

export { extractPackageData, updateAllPackages };

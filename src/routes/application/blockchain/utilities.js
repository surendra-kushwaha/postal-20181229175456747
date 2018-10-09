import logger from '../../../logger';
import postal from '../../../lib/postal';

/**
 * Promise.settle is a way to take an array of Promises, executing in parallel,
 * and wait until they are all complete regardless of failure or success.
 * It is also possible to tell which promises failed and which were successful
 *
 * This differs from Promise.all since Promise.all will stop executing
 * if any of the promises in the array fail
 */
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

const updateAllPackages = (packages: Array, newSettlementStatus: String) => {
  logger.debug(
    `Update All Packages called. ${JSON.stringify(
      packages,
    )},${newSettlementStatus}`,
  );
  const lastUpdated = new Date();
  const promises = [];
  packages.forEach(pack => {
    logger.debug(
      `Updating settlement status for one of many packages: ${JSON.stringify(
        pack,
      )}`,
    );
    const updateSettlementPayload = {
      packageId: pack.packageId,
      newSettlementStatus,
      lastUpdated,
    };
    promises.push(postal.updateSettlementStatus(updateSettlementPayload));
  });
  return Promise.settle(promises);
};

export { updateAllPackages };

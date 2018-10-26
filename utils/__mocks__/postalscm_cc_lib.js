/* eslint-disable */

module.exports = () => {
  const postalscm_lib = {};
  postalscm_lib.call_chaincode = jest.fn((options, callback) => {
    const err = undefined; // no error occurs
    const functionName = options.func;
    const response = {};
    if (functionName === 'createPostalPackage') {
      response.data = options.args;
    } else if (functionName === 'getPackageHistory') {
      response.parsed = options.args;
    } else if (functionName === 'updateShipmentStatus') {
      response.data = options.args[0];
    } else if (functionName === 'updateSettlementStatus') {
      response.data = options.args[0];
    }
    callback(err, response);
  });
  return postalscm_lib;
}
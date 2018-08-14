/* eslint-disable */

module.exports = () => {
  const postalscm_lib = {};
  postalscm_lib.call_chaincode = jest.fn((options, callback) => {
    const err = undefined; // no error occurs
    const functionName = options.func;
    const response = {};
    if (functionName === 'createPostalPackage') {
      response.data = options.args;
    }
    callback(err, response);
  });
  return postalscm_lib;
}
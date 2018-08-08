/* eslint-disable */

module.exports = () => {
  const fcw = {};
  fcw.invoke_chaincode = jest.fn();
  fcw.query_chaincode = jest.fn();
  fcw.enroll = jest.fn();
  return fcw;
};

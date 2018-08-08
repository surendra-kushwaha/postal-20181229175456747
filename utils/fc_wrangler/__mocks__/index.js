module.exports = () => {
  const fcw = {};
  fcw.enroll = jest.fn();
  fcw.query_chaincode = jest.fn();
  fcw.invoke_chaincode = jest.fn();
  return fcw;
}
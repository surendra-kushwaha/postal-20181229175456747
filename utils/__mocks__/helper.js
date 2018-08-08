/* eslint-disable */

module.exports = () => {
  const helper = {};
  helper.getBlockDelay = () => 'Got block delay';
  helper.makeSharedAccumsLibOptions = () => ({}); // return blank object
  helper.makeEnrollmentOptions = num => ({}); // return blank object
  helper.getChannelId = () => 'Test Channel';
  helper.getFirstPeerName = () => 'First Test Peer';
  helper.getPeersUrl = peer => 'Test URL';
  return helper;
};

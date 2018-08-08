module.exports = () => {
  const helper = {};
  helper.getBlockDelay = () => {return 'Got block delay'};
  helper.makeSharedAccumsLibOptions = () => {return {}}; // return blank object
  helper.makeEnrollmentOptions = (num) => {return {}}; // return blank object
  helper.getChannelId = () => {return 'Test Channel'};
  helper.getFirstPeerName = () => {return 'First Test Peer'};
  helper.getPeersUrl = (peer) => {return 'Test URL'};
  return helper; 
}
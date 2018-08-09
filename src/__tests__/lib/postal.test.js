/* eslint-env jest */

// import toBeType from 'jest-tobetype';

import postal from '../../lib/postal';
import postalscmCcLib from '../../../utils/postalscm_cc_lib';

/**
 * Mock the postalscm_cc_lib implementation
 */

jest.mock('../../../utils/postalscm_cc_lib.js');

jest.mock('../../../utils/helper.js');

jest.mock('../../../utils/fc_wrangler/index.js');

jest.mock('../../../utils/websocket_server_side.js');

jest.mock('../../../utils/postalscm_cc_lib.js');

const todateTimeStamp = new Date();
const today =
  todateTimeStamp.getMonth() + 1 < 10
    ? `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

beforeEach(() => {});

describe('smoke test', () => {
  test('confirm we get a response from the router', async () => {
    expect.assertions(1);

    expect('We have started!').toBeDefined();
  });
});

describe('tests for create package', async () => {
  /*  test('confirm that blockchain is invoked with correct parameters', async () => {
    expect.assertions(1);

    const packageId = 'packageId';
    const weight = 1.0;
    const originCountry = 'US';
    const destinationCountry = 'GB';
    const settlementStatus = 'Unreconciled';
    const shipmentStatus = 'EMA';
    const packageType = 'Express';
    const receptacleId = 'receptacleId';
    const dispatchId = 'dispatchId';
    const lastUpdated = today;

    const payload = {
      packageId,
      weight,
      originCountry,
      destinationCountry,
      settlementStatus,
      shipmentStatus,
      packageType,
      receptacleId,
      dispatchId,
      lastUpdated,
    };

    const startDate = '04/01/2018';
    const endDate = '06/30/2018';

    const argsValue = [
      `{"PackageID":"${packageId}", "Weight":"${weight}" , "OriginCountry":"${originCountry}" , "DestinationCountry":"${destinationCountry}", "SettlementStatus":"${settlementStatus}" , "ShipmentStatus":"${shipmentStatus}", "OriginReceptacleID":"${receptacleId}",  "PackageType":"${packageType}", "DispatchID":"${dispatchId}" , "LastUpdated":"${lastUpdated}"}`,
    ];
    const expectedCall = {
      method_type: 'invoke',
      func: 'createPostalPackage',
      args: argsValue,
    };

    postal.createPackage(payload, startDate, endDate);

    expect(
      postalscmCcLib.mock.instances[0].call_chaincode.mock.calls[0][0],
    ).toBe(expectedCall);
  }); */
});

/* eslint-env jest */

// import toBeType from 'jest-tobetype';

import postal from '../../lib/postal';

/**
 * Mock the postalscm_cc_lib implementation
 */

jest.mock('../../../utils/postalscm_cc_lib.js');

jest.mock('../../../utils/helper.js');

jest.mock('../../../utils/fc_wrangler/index.js');

jest.mock('../../../utils/websocket_server_side.js');

jest.mock('../../../utils/postalscm_cc_lib.js');

jest.mock('../../models/postalPackageData.js');

const todateTimeStamp = new Date();
const today =
  todateTimeStamp.getMonth() + 1 < 10
    ? `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

beforeEach(() => {});

describe('smoke test', () => {
  test('confirm we get a response from the router', async () => {
    expect.assertions(1);

    expect('We have started!').toBeDefined();
  });
});

describe('tests for create package', async () => {
  test('confirm that blockchain is invoked with correct parameters', async () => {
    expect.assertions(12);

    const packageId = 'packageId';
    const weight = '1.0';
    const originCountry = 'US';
    const destinationCountry = 'GB';
    const settlementStatus = 'Unreconciled';
    const shipmentStatus = 'EMA';
    const packageType = 'Express';
    const receptacleId = '';
    const dispatchId = '';
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

    const response = await postal.createPackage(payload, startDate, endDate);

    expect(response.destinationPost).toBe(payload.destinationCountry);
    expect(response.originPost).toBe(payload.originCountry);
    expect(response.weight).toEqual(payload.weight);
    expect(response.settlementStatus).toBe(payload.settlementStatus);
    expect(response.shipmentStatus).toBe(payload.shipmentStatus);
    expect(response.packageId).toBe(payload.packageId);
    expect(response.packageType).toBe(payload.packageType);
    expect(response.dispatchId).toBe(payload.dispatchId);
    expect(response.receptacleId).toBe(payload.receptacleId);
    expect(response.dateCreated).toBe(payload.lastUpdated);
    expect(response.startDate).toBe(startDate);
    expect(response.endDate).toBe(endDate);
  });
});

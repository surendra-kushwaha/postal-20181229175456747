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
  test('confirm that the correct object is returned from postal.js which would indicate the field conversion worked as expected', async () => {
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
describe('tests for getPackageHistory', () => {
  test('test that the proper parameters are sent to the blockchain', async () => {
    expect.assertions(1);

    const packageId = 'testPackageId';

    const response = await postal.getPackageHistory(packageId);

    expect(response).toEqual([packageId]);
  });
});
describe('tests for update shipment status', () => {
  test('test that the proper update conditions and object are sent postal.js', async () => {
    expect.assertions(2);

    const packageId = 'testPackageId';
    const shipmentStatus = 'EMC';
    const receptacleId = '';
    const dispatchId = '';
    const lastUpdated = today;
    const payload = {
      packageId,
      shipmentStatus,
      receptacleId,
      dispatchId,
      lastUpdated,
    };

    const response = await postal.updateShipmentStatus(payload);
    expect(response.updateConditions).toEqual({
      packageId,
    });
    expect(response.updateObject).toEqual({
      shipmentStatus,
      receptacleId,
      dispatchId,
      lastUpdated,
    });
  });
});
describe('tests for update settlement status', () => {
  test('test that the proper update conditions are sent postal.js', async () => {
    expect.assertions(1);

    const packageId = 'testPackageId123';
    const settlementStatus = 'Reconciled';
    const newSettlementStatus = 'Unreconciled';
    const lastUpdated = today;
    const payload = {
      packageId,
      settlementStatus,
      newSettlementStatus,
      lastUpdated,
    };

    const response = await postal.updateSettlementStatus(payload);
    expect(response.updateObject).toEqual({
      lastUpdated,
      settlementStatus: newSettlementStatus,
    });
  });
});

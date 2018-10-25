/* eslint-env jest */

import toBeType from 'jest-tobetype';
import {
  updatePackageSettlement,
  updateDispatchSettlement,
  packageHistory,
} from '../../../../routes/application/blockchain/queries';
import logger from '../../../../logger';

// need to mock the below so no attempts to connect to the blockchain are made
jest.mock('../../../../../utils/postalscm_cc_lib.js');
jest.mock('../../../../../utils/helper.js');
jest.mock('../../../../../utils/fc_wrangler/index.js');
jest.mock('../../../../../utils/websocket_server_side.js');
jest.mock('../../../../../utils/postalscm_cc_lib.js');
jest.mock('../../../../models/postalPackageData.js');

expect.extend(toBeType);

const todateTimeStamp = new Date();
const startdateTimeStamp = new Date('01/01/2018');
const enddateTimeStamp = new Date('01/20/2018');
const today =
  todateTimeStamp.getMonth() + 1 < 10
    ? `0${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
    : `${todateTimeStamp.getMonth() +
        1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

const startDate =
  new Date('01/01/2018').getMonth() + 1 < 10
    ? `0${startdateTimeStamp.getMonth() +
        1}/${startdateTimeStamp.getDate()}/${startdateTimeStamp.getFullYear()}`
    : `${startdateTimeStamp.getMonth() +
        1}/${startdateTimeStamp.getDate()}/${startdateTimeStamp.getFullYear()}`;

const endDate =
  new Date('20/01/2018').getMonth() + 1 < 10
    ? `0${enddateTimeStamp.getMonth() +
        1}/${enddateTimeStamp.getDate()}/${enddateTimeStamp.getFullYear()}`
    : `${enddateTimeStamp.getMonth() +
        1}/${enddateTimeStamp.getDate()}/${enddateTimeStamp.getFullYear()}`;

const lastUpdated = today;

const mockStatus = jest.fn();
const mockSend = jest.fn();
const mockJson = jest.fn();
const mockSendStatus = jest.fn();
beforeAll(() => {});

const res = {
  sendStatus: mockSendStatus,
  status: mockStatus,
  send: mockSend,
  json: mockJson,
};

beforeEach(() => {
  mockStatus.mockClear();
  mockSend.mockClear();
  mockJson.mockClear();
  mockSendStatus.mockClear();
});

describe('smoke test', () => {
  test('confirm we get a response from the router', async () => {
    expect.assertions(1);

    expect('We have started!').toBeDefined();
  });
});

describe('/POST updatePackageSettlement', () => {
  test('test that the proper update conditions are sent for package settlement', async () => {
    const req = {
      body: {
        id: 'queriestest1',
        newStatus: 'Settlement Disputed',
        lastUpdated,
      },
    };
    expect.assertions(2);
    const expected = {
      packageId: req.body.id,
    };
    await updatePackageSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0]).toEqual([expected]);
  });
  test('test that the proper error code is sent for bad updatePackageSettlement request', async () => {
    const req = {
      body: {
        id: 'queriestest1',
        lastUpdated,
      },
    };
    expect.assertions(3);
    await updatePackageSettlement(req, res);
    logger.debug(`Final Response: ${JSON.stringify(mockSend.mock.calls[0])}`);
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockStatus.mock.calls[0][0]).toBe(400);
    expect(mockSend.mock.calls[0]).toEqual([Error]);
  });
});

describe('/POST updateDispatchSettlement', () => {
  test('test that correct packages are updated for Settlement Disputed', async () => {
    expect.assertions(5);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: 'dispatch1',
        newStatus: 'Settlement Disputed',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].length).toBe(3);
    expect(mockSend.mock.calls[0][0][0].settlementStatus).toBe(
      'Settlement Disputed',
    );
    expect(mockSend.mock.calls[0][0][1].settlementStatus).toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][2].settlementStatus).toBe(
      'Dispute Confirmed',
    );
  });

  test('test that correct packages are updated for Settlement Requested', async () => {
    expect.assertions(5);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: 'dispatch1',
        newStatus: 'Settlement Requested',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].length).toBe(3);
    expect(mockSend.mock.calls[0][0][0].settlementStatus).toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][1].settlementStatus).toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][2].settlementStatus).toBe(
      req.body.newStatus,
    );
  });
  test('test that correct packages are updated for Settlement Agreed', async () => {
    expect.assertions(5);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: 'dispatch1',
        newStatus: 'Settlement Agreed',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].length).toBe(3);
    expect(mockSend.mock.calls[0][0][0].settlementStatus).toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][1].settlementStatus).toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][2].settlementStatus).toBe(
      req.body.newStatus,
    );
  });
  test('test that correct packages are updated for Dispute Confirmed', async () => {
    expect.assertions(5);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: 'dispatch1',
        newStatus: 'Dispute Confirmed',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].length).toBe(3);
    expect(mockSend.mock.calls[0][0][0].settlementStatus).toBe(
      'Settlement Agreed',
    );
    expect(mockSend.mock.calls[0][0][1].settlementStatus).toBe(
      'Settlement Agreed',
    );
    expect(mockSend.mock.calls[0][0][2].settlementStatus).toBe(
      'Settlement Agreed',
    );
  });

  test('test that the settlement status is not updated to wrong settlement status', async () => {
    expect.assertions(5);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: 'dispatch1',
        newStatus: 'Settlement Requested',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].length).toBe(3);
    expect(mockSend.mock.calls[0][0][0].settlementStatus).not.toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][1].settlementStatus).not.toBe(
      req.body.newStatus,
    );
    expect(mockSend.mock.calls[0][0][2].settlementStatus).not.toBe(
      req.body.newStatus,
    );
  });

  test('test that empty dispatchId is handled correctly', async () => {
    expect.assertions(3);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: '',
        newStatus: 'Settlement Disputed',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].length).toBe(1);
    expect(mockSend.mock.calls[0][0][0].settlementStatus).toBe(
      req.body.newStatus,
    );
  });

  test('test that null settlement status is handled correctly', async () => {
    expect.assertions(3);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: null,
        newStatus: 'Settlement Disputed',
      },
    };
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockStatus.mock.calls[0][0]).toBe(400);
    expect(mockSend.mock.calls[0]).toEqual([Error]);
  });
});

describe('/GET packageHistory', () => {
  test('test historian records', async () => {
    const req = {
      query: {
        packageId: 'packageHistoryTest',
      },
    };
    expect.assertions(2);
    const expected = [
      {
        date: today,
        status: 'EMA',
        statusType: 'Shipment Status',
      },
      {
        date: today,
        status: 'Unreconciled',
        statusType: 'Settlement Status',
      },
      {
        date: today,
        status: 'Reconciled',
        statusType: 'Settlement Status',
      },
      {
        date: today,
        status: 'Settlement Disputed',
        statusType: 'Settlement Status',
      },
      {
        date: today,
        status: 'EMD',
        statusType: 'Shipment Status',
      },
    ];
    await packageHistory(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0]).toEqual(expected);
  });
  test('test historian records for undefined packageId', async () => {
    const req = {
      query: {
        packageId: undefined,
      },
    };
    expect.assertions(3);
    await packageHistory(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockStatus.mock.calls[0][0]).toBe(405);
    expect(mockSend.mock.calls[0]).toEqual([Error]);
  });
});

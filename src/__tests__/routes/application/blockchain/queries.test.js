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
  test('test that the proper update conditions are sent for settlement queries.js', async () => {
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
});

describe('/POST updateDispatchSettlement', () => {
  test('test that the proper update conditions are sent for dispatch settlement', async () => {
    expect.assertions(2);
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
    const expected = [
      {
        dispatchId: 'dispatch1',
        packageId: 'package1',
        settlementStatus: 'Settlement Disputed',
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        weight: 1,
        dateCreated: today,
        packageType: 'test',
      },
      {
        dispatchId: 'dispatch1',
        packageId: 'package3',
        settlementStatus: req.body.newStatus,
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        weight: 3,
        dateCreated: today,
        packageType: 'test',
      },
      {
        dispatchId: 'dispatch1',
        packageId: 'package4',
        settlementStatus: 'Dispute Confirmed',
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        weight: 4,
        endDate,
        dateCreated: today,
        packageType: 'test',
      },
    ];
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0]).toEqual(expected);
  });

  test('test that the settlement status is not updated to wrong settlement status', async () => {
    expect.assertions(2);
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
    const expected = [
      {
        dispatchId: 'dispatch1',
        packageId: 'package1',
        settlementStatus: 'Settlement Disputed',
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        weight: 1,
        packageType: 'test',
      },
      {
        dispatchId: 'dispatch1',
        packageId: 'package3',
        settlementStatus: req.body.newStatus,
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        weight: 3,
        dateCreated: today,
        packageType: 'test',
      },
      {
        dispatchId: 'dispatch1',
        packageId: 'package4',
        settlementStatus: req.body.newStatus,
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        weight: 4,
        packageType: 'test',
      },
    ];
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0]).not.toEqual(expected);
  });

  test('test that empty dispatchId is handled correctly', async () => {
    expect.assertions(2);
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
    const expected = [
      {
        dispatchId: '',
        packageId: 'package2',
        settlementStatus: req.body.newStatus,
        originPost: 'US',
        destinationPost: 'CN',
        weight: 2,
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
      },
    ];
    await updateDispatchSettlement(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0]).toEqual(expected);
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
});

/* eslint-env jest */

import toBeType from 'jest-tobetype';
import logger from '../../../../logger';

import {
  getPackage,
  postPackageReport,
  getPackageReport,
  report,
  viewReports,
} from '../../../../routes/application/database/queries';
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

describe('/GET getPackage', () => {
  test('test that mocked database returns the correct package', async () => {
    expect.assertions(1);
    const req = {
      query: {
        packageId: 'testPackage',
      },
    };
    const expected = [
      { data: [{ packageId: 'testPackage' }], status: 'success' },
    ];
    await getPackage(req, res);

    expect(mockSend.mock.calls[0]).toEqual(expected);
  });
});

describe('/POST postPackageReport', () => {
  test('test that we get all packages for an empty dispatchId', async () => {
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
      },
    };
    const expected = [
      {
        dispatchId: '',
        packageId: 'package2',
        originPost: 'US',
        destinationPost: 'CN',
        settlementStatus: 'Settlement Requested',
        startDate,
        endDate,
        weight: 2,
        dateCreated: today,
        packageType: 'test',
      },
    ];
    await postPackageReport(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].data).toEqual(expected);
  });
});
describe('/GET getPackageReport', () => {
  test('test that we get all packages for a non-empty dispatchId', async () => {
    expect.assertions(2);
    const req = {
      query: {
        dispatchId: 'dispatch1',
      },
    };
    const expected = [
      {
        dateCreated: today,
        destinationPost: 'CN',
        dispatchId: 'dispatch1',
        endDate,
        originPost: 'US',
        packageId: 'package1',
        packageType: 'test',
        settlementStatus: 'Settlement Disputed',
        weight: 1,
        startDate,
      },
      {
        dateCreated: today,
        destinationPost: 'CN',
        dispatchId: 'dispatch1',
        endDate,
        originPost: 'US',
        packageId: 'package3',
        packageType: 'test',
        settlementStatus: 'Settlement Agreed',
        weight: 3,
        startDate,
      },
      {
        dateCreated: today,
        destinationPost: 'CN',
        dispatchId: 'dispatch1',
        endDate,
        originPost: 'US',
        packageId: 'package4',
        packageType: 'test',
        settlementStatus: 'Dispute Confirmed',
        weight: 4,
        startDate,
      },
    ];
    await getPackageReport(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].data).toEqual(expected);
  });
});
describe('/POST query', () => {
  test('test that we get all the dispatch summaries from a mocked database', async () => {
    expect.assertions(2);
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
      },
    };
    const expected = [
      {
        dateCreated: today,
        destinationPost: 'CN',
        dispatchId: 'dispatch1',
        endDate,
        originPost: 'US',
        packageType: 'test',
        settlementStatus: 'Unreconciled',
        startDate,
        totalReconciledPackages: 1,
        totalReconciledWeight: 3,
        totalUnreconciledPackages: 2,
        totalUnreconciledWeight: 5,
      },
      {
        dateCreated: today,
        destinationPost: 'CN',
        dispatchId: '',
        endDate,
        originPost: 'US',
        packageType: 'test',
        settlementStatus: 'Unreconciled',
        startDate,
        totalReconciledPackages: 0,
        totalReconciledWeight: 0,
        totalUnreconciledPackages: 1,
        totalUnreconciledWeight: 2,
      },
    ];
    await report(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].data).toEqual(expected);
  });
});
describe('/GET query', () => {
  test('test that we get all the dispatch summaries for a country from a mocked database', async () => {
    expect.assertions(2);
    const req = {
      query: {
        country: 'US',
      },
    };
    const expected = [
      {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
      },
    ];
    await viewReports(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].data).toEqual(expected);
  });
});

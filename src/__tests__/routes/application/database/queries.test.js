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
  test('test that mocked database returns the error for undefined packageId', async () => {
    expect.assertions(1);
    const req = {
      query: {
        packageId: undefined,
      },
    };
    await getPackage(req, res);
    const expected = [{ status: 'fail', data: { msg: Error } }];
    expect(mockSend.mock.calls[0]).toEqual(expected);
  });
});

describe('/POST postPackageReport', () => {
  test('test that we get all packages for an empty dispatchId', async () => {
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
    await postPackageReport(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect.assertions(mockSend.mock.calls[0][0].data + 1);
    expect(mockSend.mock.calls.length).toBe(1);
    mockSend.mock.calls[0][0].data.forEach(dispatch => {
      expect(dispatch.dispatchId).toBe(req.body.dispatchId);
    });
  });
  test('test that we catch correct error for null dispatchId', async () => {
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
        packageType: 'test',
        dispatchId: null,
      },
    };
    await postPackageReport(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    const expected = [{ status: 'fail', data: { msg: Error } }];
    expect.assertions(1);
    expect(mockSend.mock.calls[0]).toEqual(expected);
  });
});
describe('/GET getPackageReport', () => {
  test('test that we get all packages for a non-empty dispatchId', async () => {
    expect.assertions(5);
    const req = {
      query: {
        dispatchId: 'dispatch1',
      },
    };
    await getPackageReport(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].data.length).toBe(3);
    expect(mockSend.mock.calls[0][0].data[0].dispatchId).toBe(
      req.query.dispatchId,
    );
    expect(mockSend.mock.calls[0][0].data[1].dispatchId).toBe(
      req.query.dispatchId,
    );
    expect(mockSend.mock.calls[0][0].data[2].dispatchId).toBe(
      req.query.dispatchId,
    );
  });
  test('test that we catch correct error for null dispatchId', async () => {
    const req = {
      query: {
        dispatchId: null,
      },
    };
    await getPackageReport(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    const expected = [{ status: 'fail', data: { msg: Error } }];
    expect.assertions(1);
    expect(mockSend.mock.calls[0]).toEqual(expected);
  });
});
describe('/POST report', () => {
  test('test that we get all the dispatch summaries from a mocked database', async () => {
    const req = {
      body: {
        originPost: 'US',
        destinationPost: 'CN',
        startDate,
        endDate,
        dateCreated: today,
      },
    };
    await report(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect.assertions(mockSend.mock.calls[0][0].data.length * 5 + 1);
    expect(mockSend.mock.calls.length).toBe(1);
    mockSend.mock.calls[0][0].data.forEach(dispatch => {
      expect(dispatch.originPost).toBe(req.body.originPost);
      expect(dispatch.destinationPost).toBe(req.body.destinationPost);
      expect(dispatch.startDate).toBe(req.body.startDate);
      expect(dispatch.endDate).toBe(req.body.endDate);
      expect(dispatch.dateCreated).toBe(req.body.dateCreated);
    });
  });
  test('test that we get all the dispatch summaries from a mocked database', async () => {
    const req = {
      body: {
        originPost: undefined,
        destinationPost: undefined,
        startDate: undefined,
        endDate: undefined,
        dateCreated: undefined,
      },
    };
    await report(req, res);
    const expected = [{ status: 'fail', data: { msg: Error } }];
    expect.assertions(1);
    expect(mockSend.mock.calls[0]).toEqual(expected);
  });
});
describe('/GET  viewReports', () => {
  test('test that we get all the dispatch summaries for a country from a mocked database', async () => {
    const req = {
      query: {
        country: 'US',
      },
    };
    await viewReports(req, res);
    logger.debug(
      `Final Response: ${JSON.stringify(mockSend.mock.calls[0][0].data)}`,
    );
    expect.assertions(mockSend.mock.calls[0][0].data.length + 1);
    expect(mockSend.mock.calls.length).toBe(1);
    mockSend.mock.calls[0][0].data.forEach(dispatch => {
      expect(
        dispatch.originPost === req.query.country ||
          dispatch.destinationPost === req.query.country,
      ).toBeTruthy();
    });
  });
  test('test that we catch correct error for undefined country code', async () => {
    const req = {
      query: {
        country: undefined,
      },
    };
    await viewReports(req, res);
    const expected = [{ status: 'fail', data: { msg: Error } }];
    expect.assertions(1);
    expect(mockSend.mock.calls[0]).toEqual(expected);
  });
});

/* eslint-env jest */

import toBeType from 'jest-tobetype';
import logger from '../../../../logger';

import { inputData } from '../../../../routes/application/generate_data/queries';
import { extractPackageData } from '../../../../routes/application/generate_data/utilities';

// need to mock the below so no attempts to connect to the blockchain are made
jest.mock('../../../../../utils/postalscm_cc_lib.js');
jest.mock('../../../../../utils/helper.js');
jest.mock('../../../../../utils/fc_wrangler/index.js');
jest.mock('../../../../../utils/websocket_server_side.js');
jest.mock('../../../../../utils/postalscm_cc_lib.js');
jest.mock('../../../../models/postalPackageData.js');

expect.extend(toBeType);

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
// const todateTimeStamp = new Date();
// const today =
//   todateTimeStamp.getMonth() + 1 < 10
//     ? `0${todateTimeStamp.getMonth() +
//         1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
//     : `${todateTimeStamp.getMonth() +
//         1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;
const req = {
  body: [
    {
      packageId: 'TS34234US',
      netReceptacleWeight: '25',
      grossReceptacleWeight: '25',
      receptacleId: 'QWERTYUIOPASDFGHJKLZXCVB',
      destination: 'CN',
      shipmentStatus: 'EMA',
      timestamp: new Date(),
    },
    {
      packageId: 'TS34235US',
      netReceptacleWeight: '26',
      grossReceptacleWeight: '25',
      receptacleId: 'QWERTYUITPASDFGHJKLZXCVB',
      destination: 'CN',
      shipmentStatus: 'EMC',
      timestamp: new Date(),
    },
    {
      packageId: 'TS34254US',
      netReceptacleWeight: '25',
      grossReceptacleWeight: '25',
      receptacleId: 'QWERTYUIOPA4DFGHJKLZXCVB',
      destination: 'CN',
      shipmentStatus: 'EM',
      timestamp: new Date(),
    },
    {
      packageId: 'TS34244US',
      netReceptacleWeight: '25',
      grossReceptacleWeight: '25',
      receptacleId: 'QWERTYUIOPASDFGHJKLZXCVB',
      destination: 'CN',
      shipmentStatus: 'EMA',
      timestamp: new Date(),
    },
  ],
};
const expected = {
  updateDispatch: [
    { packageId: 'TS34235US', newDispatchId: 'QWERTYUITPASDFGHJKLZ' },
  ],
  updateReceptacle: [
    {
      packageId: 'TS34235US',
      newReceptacleId: 'QWERTYUITPASDFGHJKLZXCVB',
      newReceptacleNetWeight: '26',
      newReceptacleGrossWeight: '25',
    },
  ],
  updateShipmentStatus: [
    {
      packageId: 'TS34235US',
      newShipmentStatus: 'EMC',
      lastUpdated: new Date(),
    },
    {
      packageId: 'TS34254US',
      newShipmentStatus: 'EM',
      lastUpdated: new Date(),
    },
  ],
  createPackage: [
    {
      packageId: 'TS34234US',
      destination: 'CN',
      packageType: 'TS',
      origin: 'US',
      weight: '25',
      dateCreated: new Date(),
      lastUpdated: new Date(),
    },
    {
      packageId: 'TS34244US',
      destination: 'CN',
      packageType: 'TS',
      origin: 'US',
      weight: '25',
      dateCreated: new Date(),
      lastUpdated: new Date(),
    },
  ],
};
describe('smoke test', () => {
  test('confirm we get a response from the router', async () => {
    expect.assertions(1);

    expect('We have started!').toBeDefined();
  });
});

describe('/POST input-data', () => {
  test('test that package data is created correctly', async () => {
    expect.assertions(1);
    const response = await extractPackageData(req.body);
    logger.debug(`Response: ${JSON.stringify(response)}`);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < response.createPackage.length; i++) {
      expected.createPackage[i].dateCreated =
        response.createPackage[i].dateCreated;
      expected.createPackage[i].lastUpdated =
        response.createPackage[i].lastUpdated;
      expected.updateShipmentStatus[i].lastUpdated =
        response.updateShipmentStatus[i].lastUpdated;
    }
    expect(response).toEqual(expected);
  });
  test('test that all packages are updated', async () => {
    expect.assertions(1);
    await inputData(req, res);
    logger.debug(`Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`);
    expect(mockSend.mock.calls[0][0]).toEqual({ data: 'success' });
  });
  // test('test that correct error response is sent for wrong recepticleId', async () => {
  //   expect.assertions(1);
  //   req.body[0].receptacleId = 'AB';
  //   await extractPackageData(req.body);
  //   logger.debug(`Response: ${JSON.stringify(mockSend.mock.calls[0][0])}`);
  //   expect(mockSend.mock.calls[0][0]).toEqual({ data: 'success' });
  // });
});

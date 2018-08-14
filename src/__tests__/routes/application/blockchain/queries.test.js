/* eslint-env jest */

import toBeType from 'jest-tobetype';
/* import {
  updateDispatchSettlement,
  updatePackageSettlement,
  packageHistory,
} from '../../../../routes/application/blockchain/queries'; */

jest.mock('../../../../lib/postal');

// need to mock the below so no attempts to connect to the blockchain are made
jest.mock('../../../../../utils/postalscm_cc_lib.js');
jest.mock('../../../../../utils/helper.js');
jest.mock('../../../../../utils/fc_wrangler/index.js');
jest.mock('../../../../../utils/websocket_server_side.js');
jest.mock('../../../../../utils/postalscm_cc_lib.js');

expect.extend(toBeType);

describe('smoke test', () => {
  test('confirm we get a response from the router', async () => {
    expect.assertions(1);

    expect('We have started!').toBeDefined();
  });
});

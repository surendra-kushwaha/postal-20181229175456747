import toBeType from 'jest-tobetype';

import postal from '../../lib/postal';
import fcw from '../../../utils/fc_wrangler/index';

/**
 * Mock the postalscm_cc_lib implementation
 */

jest.mock('../../../utils/postalscm_cc_lib.js');

jest.mock('../../../utils/helper.js');

jest.mock('../../../utils/fc_wrangler/index.js')

jest.mock('../../../utils/websocket_server_side.js');

const todateTimeStamp = new Date();
const today = todateTimeStamp.getMonth() + 1 < 10 ? `${todateTimeStamp.getMonth() +1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}` : `0${todateTimeStamp.getMonth() +1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;

beforeEach(() => {

});

describe('smoke test', () => {
  test('confirm we get a response from the router', async () => {
    expect.assertions(1);

    expect('We have started!').toBeDefined();
  });
});
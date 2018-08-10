/* eslint-env jest */

import toBeType from 'jest-tobetype';
import config from '../../config';
import DispatchSimulator from '../../lib/simulate';

jest.mock('../../config');

// need to mock the below so no attempts to connect to the blockchain are made
jest.mock('../../../utils/postalscm_cc_lib.js');
jest.mock('../../../utils/helper.js');
jest.mock('../../../utils/fc_wrangler/index.js');
jest.mock('../../../utils/websocket_server_side.js');
jest.mock('../../../utils/postalscm_cc_lib.js');

expect.extend(toBeType);

const simulator = new DispatchSimulator();

const PackageType = ['LA', 'CA', 'EX', 'UA', 'RA']; // tracked,parcels,express,untracked,registered
const Countrys = ['US', 'CN', 'GB', 'DE', 'CA', 'JP', 'FR'];
const AirportsUS = ['JFKA'];
const AirportsCN = ['BJSA'];
const AirportsUK = ['LONA', 'CVTA'];
const AirportsDE = ['FRAA'];
const AirportsCA = ['YTOA'];
const AirportsJP = ['TYOA'];
const AirportsFR = ['CDGA'];

const shipmentStatuses = [
  ['EXA'],
  ['EXC'],
  ['EMC', 'PREDES'],
  ['RESDES', 'EMD'],
  ['EDA', 'EDB'],
  ['EDC'],
  ['EMF', 'EDD', 'EDE'],
  ['EMI', 'EMH', 'EMG', 'EDF', 'EDG', 'EDH'],
];

let origin;
let destination;

// helper functions
const randomArray = items => items[Math.floor(items.length * Math.random())];

const getAirportArray = countryCode => {
  let airports = [];
  if (countryCode === 'US') {
    airports = AirportsUS;
  } else if (countryCode === 'CN') {
    airports = AirportsCN;
  } else if (countryCode === 'CA') {
    airports = AirportsCA;
  } else if (countryCode === 'GB') {
    airports = AirportsUK;
  } else if (countryCode === 'JP') {
    airports = AirportsJP;
  } else if (countryCode === 'FR') {
    airports = AirportsFR;
  } else if (countryCode === 'DE') {
    airports = AirportsDE;
  }

  return airports;
};

const getPackageTypeCode = packageType => {
  let packageTypeCode = '';
  if (packageType === 'Tracked Packet') {
    packageTypeCode = 'LA';
  } else if (packageType === 'Parcels') {
    packageTypeCode = 'CA';
  } else if (packageType === 'Express') {
    packageTypeCode = 'EX';
  } else if (packageType === 'Untracked Packets') {
    packageTypeCode = 'UA';
  } else if (packageType === 'Registered') {
    packageTypeCode = 'RA';
  }

  return packageTypeCode;
};

beforeEach(() => {
  origin = randomArray(Countrys);
  destination = randomArray(Countrys);
});

describe('test the functionality of the simulator for creating the EDI Messages', () => {
  describe('test normal "happy path" creation', () => {
    beforeAll(() => {
      config.simulate = {
        size: {
          small: 1,
        },
        days: [1, 2, 1, 1, 3, 1, 1, 1, 2],
        ReceivedinExcess_rate: 0,
        LostParcel_rate: 0, // over 100 %
        SeizedorReturned_rate: 0, // over 100 %
        NoPreDes_rate: 0, // over 100 %
      };
    });
    test('make sure two sets of arrays are created', async () => {
      expect.assertions(6);
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response).toBeType('array');
      expect(response.length).toBe(2);
      expect(response[0]).toBeType('array');
      expect(response[0].length).toBe(1);
      expect(response[1]).toBeType('array');
      expect(response[1].length).toBe(8);
    });
    describe('tests for the first array which creates the package', () => {
      test('confirms correct statuses were assigned', async () => {
        expect.assertions(2);
        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        expect(response[0][0].shipmentStatus === 'EMA').toBe(true);
        expect(response[0][0].settlementStatus === 'Unreconciled').toBe(true);
      });
      test('validate a proper package type was chosen', async () => {
        expect.assertions(9);
        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );
        let packageTypeCode;
        const [[{ packageType }]] = response;
        if (packageType === 'Tracked Packet') {
          packageTypeCode = 'LA';
        }
        if (packageType === 'Parcels') {
          packageTypeCode = 'CA';
        }
        if (packageType === 'Express') {
          packageTypeCode = 'EX';
        }
        if (packageType === 'Untracked Packets') {
          packageTypeCode = 'UA';
        }
        if (packageType === 'Registered') {
          packageTypeCode = 'RA';
        }
        expect(PackageType.includes(packageTypeCode)).toBe(true);

        // make sure the package type is consistent throughout the simulations
        expect(response[1][0].packageType === packageType).toBe(true);
        expect(response[1][1].packageType === packageType).toBe(true);
        expect(response[1][2].packageType === packageType).toBe(true);
        expect(response[1][3].packageType === packageType).toBe(true);
        expect(response[1][4].packageType === packageType).toBe(true);
        expect(response[1][5].packageType === packageType).toBe(true);
        expect(response[1][6].packageType === packageType).toBe(true);
        expect(response[1][7].packageType === packageType).toBe(true);
      });
      test('validate the construction and format of the packageId', async () => {
        expect.assertions(9);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        const [[{ packageId }]] = response;
        const [[{ packageType }]] = response;
        const packageTypeCode = getPackageTypeCode(packageType);

        const expected = new RegExp(`${packageTypeCode}[0-9]{9}${origin}`); // create expected regex

        expect(packageId).toMatch(expected); // confirm format is correct

        // confirm update message contain same packageId
        expect(response[1][0].packageId === packageId).toBe(true);
        expect(response[1][1].packageId === packageId).toBe(true);
        expect(response[1][2].packageId === packageId).toBe(true);
        expect(response[1][3].packageId === packageId).toBe(true);
        expect(response[1][4].packageId === packageId).toBe(true);
        expect(response[1][5].packageId === packageId).toBe(true);
        expect(response[1][6].packageId === packageId).toBe(true);
        expect(response[1][7].packageId === packageId).toBe(true);
      });
      test('make sure first scan does not include dispatchId', async () => {
        expect.assertions(1);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        const [[{ dispatchId }]] = response;

        expect(dispatchId).toBeFalsy();
      });
      test('make sure first scan does not include receptacleId', async () => {
        expect.assertions(1);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        const receptacleId = response[0][0].recepatacleId;

        expect(receptacleId).toBeFalsy();
      });
      test('check that the weight makes sense', async () => {
        expect.assertions(10);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        const [[{ packageType }]] = response;
        const [[{ weight }]] = response;
        if (packageType === 'Tracked Packet') {
          expect(weight).toBeGreaterThanOrEqual(0.1);
          expect(weight).toBeLessThanOrEqual(1.99);
        }
        if (packageType === 'Parcels') {
          expect(weight).toBeGreaterThanOrEqual(2);
          expect(weight).toBeLessThanOrEqual(10);
        }
        if (packageType === 'Express') {
          expect(weight).toBeGreaterThanOrEqual(2);
          expect(weight).toBeLessThanOrEqual(10);
        }
        if (packageType === 'Untracked Packets') {
          expect(weight).toBeGreaterThanOrEqual(0.1);
          expect(weight).toBeLessThanOrEqual(1.99);
        }
        if (packageType === 'Registered') {
          expect(weight).toBeGreaterThanOrEqual(0.1);
          expect(weight).toBeLessThanOrEqual(1.99);
        }

        expect(weight === response[1][0].weight).toBe(true);
        expect(weight === response[1][1].weight).toBe(true);
        expect(weight === response[1][2].weight).toBe(true);
        expect(weight === response[1][3].weight).toBe(true);
        expect(weight === response[1][4].weight).toBe(true);
        expect(weight === response[1][5].weight).toBe(true);
        expect(weight === response[1][6].weight).toBe(true);
        expect(weight === response[1][7].weight).toBe(true);
      });
    });
    describe('tests that focus on the update array', () => {
      test('check that the dispatchId is in the correct format', async () => {
        expect.assertions(9);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );
        const [[{ packageType }]] = response;
        const expectedDispatchId = new RegExp(
          `${origin}([A-Z]{4})${destination}([A-Z]{4})` +
            `A${getPackageTypeCode(packageType)}8` +
            `[0-9]{4}`,
        );

        const [, [, , { dispatchId }]] = response;
        expect(dispatchId).toMatch(expectedDispatchId);

        // the dispatchId is set at PREDES/EMC it should not be set before that
        expect(response[1][0].dispatchId).toBeFalsy();
        expect(response[1][1].dispatchId).toBeFalsy();
        expect(response[1][2].dispatchId).toBe(dispatchId);
        expect(response[1][3].dispatchId).toBe(dispatchId);
        expect(response[1][4].dispatchId).toBe(dispatchId);
        expect(response[1][5].dispatchId).toBe(dispatchId);
        expect(response[1][6].dispatchId).toBe(dispatchId);
        expect(response[1][7].dispatchId).toBe(dispatchId);
      });
      test('check that the receptacleId is in the correct format', async () => {
        expect.assertions(9);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        const [, [, , { receptacleId }]] = response;
        const [, [, , { dispatchId }]] = response;
        const [[{ weight }]] = response;
        let weightstring = parseInt(weight * 10, 10).toString();
        while (weightstring.length < 4) {
          // fill 4 char with zeros
          weightstring = `0${weightstring}`;
        }

        const expectedReceptacleId = new RegExp(
          `${dispatchId}[0-9]{3}[019]0${weightstring}`,
        );

        expect(receptacleId).toMatch(expectedReceptacleId);

        // the receptacleId is set at PREDES/EMC it should not be set before that
        expect(response[1][0].receptacleId).toBeFalsy();
        expect(response[1][1].receptacleId).toBeFalsy();
        expect(response[1][2].receptacleId).toBe(receptacleId);
        expect(response[1][3].receptacleId).toBe(receptacleId);
        expect(response[1][4].receptacleId).toBe(receptacleId);
        expect(response[1][5].receptacleId).toBe(receptacleId);
        expect(response[1][6].receptacleId).toBe(receptacleId);
        expect(response[1][7].receptacleId).toBe(receptacleId);
      });
      test('check that the airport is correct', async () => {
        expect.assertions(2);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        const [[{ packageType }]] = response;
        const expectedDispatchId = new RegExp(
          `${origin}([A-Z]{4})${destination}([A-Z]{4})` +
            `A${getPackageTypeCode(packageType)}8` +
            `[0-9]{4}`,
        );

        const [, [, , { dispatchId }]] = response;

        const matchArray = dispatchId.match(expectedDispatchId);

        const originAirport = getAirportArray(origin);
        const destinationAirport = getAirportArray(destination);

        expect(originAirport).toContain(matchArray[1]);
        expect(destinationAirport).toContain(matchArray[2]);
      });
      test('make sure the shipment statuses are correct', async () => {
        expect.assertions(8);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        // scroll through all the message for
        expect(shipmentStatuses[0]).toContain(response[1][0].shipmentStatus);
        expect(shipmentStatuses[1]).toContain(response[1][1].shipmentStatus);
        expect(shipmentStatuses[2]).toContain(response[1][2].shipmentStatus);
        expect(shipmentStatuses[3]).toContain(response[1][3].shipmentStatus);
        expect(shipmentStatuses[4]).toContain(response[1][4].shipmentStatus);
        expect(shipmentStatuses[5]).toContain(response[1][5].shipmentStatus);
        expect(shipmentStatuses[6]).toContain(response[1][6].shipmentStatus);
        expect(shipmentStatuses[7]).toContain(response[1][7].shipmentStatus);
      });

      test('make sure the settlement statuses are correct', async () => {
        expect.assertions(8);

        const response = await simulator.simulate(
          'small',
          origin,
          destination,
          '04/01/2018',
          '06/30/2018',
        );

        expect(response[1][0].settlementStatus).toBe('Unreconciled');
        expect(response[1][1].settlementStatus).toBe('Unreconciled');
        expect(response[1][2].settlementStatus).toBe('Unreconciled');
        expect(response[1][3].settlementStatus).toBe('Unreconciled');
        expect(response[1][4].settlementStatus).toBe('Unreconciled');
        expect(response[1][5].settlementStatus).toBe('Unreconciled');
        expect(response[1][6].settlementStatus).toBe('Unreconciled');

        expect(response[1][7].settlementStatus).toBe('Reconciled');
      });
    });
  });
  describe('test cases for messages with no PREDES', () => {
    beforeAll(() => {
      config.simulate = {
        size: {
          small: 1,
        },
        days: [1, 2, 1, 1, 3, 1, 1, 1, 2],
        ReceivedinExcess_rate: 0,
        LostParcel_rate: 0, // over 100 %
        SeizedorReturned_rate: 0, // over 100 %
        NoPreDes_rate: 100, // over 100 %
      };
    });
    test('make sure the packageId follows the right format', async () => {
      expect.assertions(8);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId }]] = response;
      const [[{ packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}4444[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);

      expect(response[1][0].packageId).toBe(packageId);
      expect(response[1][1].packageId).toBe(packageId);
      expect(response[1][2].packageId).toBe(packageId);
      expect(response[1][3].packageId).toBe(packageId);
      expect(response[1][4].packageId).toBe(packageId);
      expect(response[1][5].packageId).toBe(packageId);
      expect(response[1][6].packageId).toBe(packageId);
    });
    test('confirm the correct shipment statuses are assigned', async () => {
      expect.assertions(9);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      // only 7 update messages since there is no PREDES message
      expect(response[1].length).toBe(7);

      expect(response[0][0].shipmentStatus).toBe('EMA');
      expect(response[1][0].shipmentStatus).toBe('EXA');
      expect(response[1][1].shipmentStatus).toBe('EXC');
      // shipmentStatuses[2] is the PREDES message so we skip it
      expect(shipmentStatuses[3]).toContain(response[1][2].shipmentStatus);
      expect(shipmentStatuses[4]).toContain(response[1][3].shipmentStatus);
      expect(shipmentStatuses[5]).toContain(response[1][4].shipmentStatus);
      expect(shipmentStatuses[6]).toContain(response[1][5].shipmentStatus);
      expect(shipmentStatuses[7]).toContain(response[1][6].shipmentStatus);
    });
    test('test the settlementStatuses of the messages', async () => {
      expect.assertions(9);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      // only 7 update messages since there is no PREDES message
      expect(response[1].length).toBe(7);

      expect(response[0][0].settlementStatus).toBe('Unreconciled');
      expect(response[1][0].settlementStatus).toBe('Unreconciled');
      expect(response[1][1].settlementStatus).toBe('Unreconciled');
      expect(response[1][2].settlementStatus).toBe('Unreconciled');
      expect(response[1][3].settlementStatus).toBe('Unreconciled');
      expect(response[1][4].settlementStatus).toBe('Unreconciled');
      expect(response[1][5].settlementStatus).toBe('Unreconciled');
      // we still expect to see NO PREDES messages to become reconciled
      expect(response[1][6].settlementStatus).toBe('Reconciled');
    });
  });
  describe('test cases for messages with lost parcel', () => {
    beforeAll(() => {
      config.simulate = {
        size: {
          small: 4,
        },
        days: [1, 2, 1, 1, 3, 1, 1, 1, 2],
        ReceivedinExcess_rate: 0,
        LostParcel_rate: 100, // over 100 %
        SeizedorReturned_rate: 0, // over 100 %
        NoPreDes_rate: 0, // over 100 %
      };
    });
    test('make sure the packageId follows the right format', async () => {
      expect.assertions(1);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId }]] = response;
      const [[{ packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}2222[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);
    });
    test('make sure that the parcel gets created properly', async () => {
      expect.assertions(5);

      // we have 4 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0].length).toBe(4);

      // we still expect all packages to be created normally
      expect(response[0][0].shipmentStatus).toBe('EMA');
      expect(response[0][1].shipmentStatus).toBe('EMA');
      expect(response[0][2].shipmentStatus).toBe('EMA');
      expect(response[0][3].shipmentStatus).toBe('EMA');
    });
  });
  describe('test cases for messages with seized or returned', () => {
    beforeAll(() => {
      config.simulate = {
        size: {
          small: 1,
        },
        days: [1, 2, 1, 1, 3, 1, 1, 1, 2],
        ReceivedinExcess_rate: 0,
        LostParcel_rate: 0, // over 100 %
        SeizedorReturned_rate: 100, // over 100 %
        NoPreDes_rate: 0, // over 100 %
      };
    });
    test('make sure the packageId follows the right format', async () => {
      expect.assertions(1);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId }]] = response;
      const [[{ packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}3333[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);
    });
    test('make sure that the package have the correct shipment statuses', async () => {
      expect.assertions(3);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // we still expect package to be created normally
      expect(response[0][0].shipmentStatus).toBe('EMA');

      const indexLastPackage = response[1].length - 1;

      const seizedByCustomsStatuses = ['EME', 'EXB', 'EDX', 'EXX'];

      expect(seizedByCustomsStatuses).toContain(
        response[1][indexLastPackage].shipmentStatus,
      );
      expect(response[1][indexLastPackage].settlementStatus).toBe(
        'Unreconciled',
      );
    });
  });
  describe('test cases for messages with received in excess', () => {
    beforeAll(() => {
      config.simulate = {
        size: {
          small: 1,
        },
        days: [1, 2, 1, 1, 3, 1, 1, 1, 2],
        ReceivedinExcess_rate: 100,
        LostParcel_rate: 0, // over 100 %
        SeizedorReturned_rate: 0, // over 100 %
        NoPreDes_rate: 0, // over 100 %
      };
    });
    test('make sure the packageId follows the right format', async () => {
      expect.assertions(5);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId }]] = response;
      const [[{ packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}1111[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);

      expect(response[1][0].packageId).toBe(packageId);
      expect(response[1][1].packageId).toBe(packageId);
      expect(response[1][2].packageId).toBe(packageId);
      expect(response[1][3].packageId).toBe(packageId);
    });
    test('make sure that packages do not have any origin scans', async () => {
      expect.assertions(6);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[1].length).toBe(4);
      // shipmentStatuses[3] is the first set of scans done in the destination
      expect(shipmentStatuses[3]).toContain(response[0][0].shipmentStatus);

      expect(shipmentStatuses[4]).toContain(response[1][0].shipmentStatus);
      expect(shipmentStatuses[5]).toContain(response[1][1].shipmentStatus);
      expect(shipmentStatuses[6]).toContain(response[1][2].shipmentStatus);
      expect(shipmentStatuses[7]).toContain(response[1][3].shipmentStatus);
    });
    test('make sure the settlement statuses are correct', async () => {
      expect.assertions(5);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response[0][0].settlementStatus).toBe('Unreconciled');

      expect(response[1][0].settlementStatus).toBe('Unreconciled');
      expect(response[1][1].settlementStatus).toBe('Unreconciled');
      expect(response[1][2].settlementStatus).toBe('Unreconciled');
      expect(response[1][3].settlementStatus).toBe('Reconciled');
    });
  });
});

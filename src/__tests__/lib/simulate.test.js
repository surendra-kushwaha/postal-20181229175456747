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
const AirportsUS = ['JFKA', 'ORDA'];
const AirportsCN = ['BJSA', 'PVGA'];
const AirportsUK = ['LONA', 'CVTA'];
const AirportsDE = ['FRAA', 'FRAB'];
const AirportsCA = ['YTOA', 'YTOB'];
const AirportsJP = ['TYOA', 'TYOB'];
const AirportsFR = ['CDGA', 'CDGB'];

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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
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

        expect(dispatchId).toBe('');
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

        expect(receptacleId).toBeUndefined();
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
        expect(response[1][0].dispatchId).toBe('');
        expect(response[1][1].dispatchId).toBe('');
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
        expect(response[1][0].receptacleId).toBe('');
        expect(response[1][1].receptacleId).toBe('');
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
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
    test('confirm that updates do not have dispatchId', async () => {
      expect.assertions(8);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0][0].dispatchId).toBe('');

      expect(response[1][0].dispatchId).toBe('');
      expect(response[1][1].dispatchId).toBe('');
      expect(response[1][2].dispatchId).toBe('');
      expect(response[1][3].dispatchId).toBe('');
      expect(response[1][4].dispatchId).toBe('');
      expect(response[1][5].dispatchId).toBe('');
      expect(response[1][6].dispatchId).toBe('');
    });
    test('confirm that updates do not have receptacleId', async () => {
      expect.assertions(8);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0][0].receptacleId).toBe('');

      expect(response[1][0].receptacleId).toBe('');
      expect(response[1][1].receptacleId).toBe('');
      expect(response[1][2].receptacleId).toBe('');
      expect(response[1][3].receptacleId).toBe('');
      expect(response[1][4].receptacleId).toBe('');
      expect(response[1][5].receptacleId).toBe('');
      expect(response[1][6].receptacleId).toBe('');
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
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
    test('confirm that updates do not have dispatchId', async () => {
      expect.assertions(5);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0][0].dispatchId).toBe('');

      expect(response[1][0].dispatchId).toBe('');
      expect(response[1][1].dispatchId).toBe('');
      expect(response[1][2].dispatchId).toBe('');
      expect(response[1][3].dispatchId).toBe('');
    });
    test('confirm that updates do not have receptacleId', async () => {
      expect.assertions(5);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0][0].receptacleId).toBe('');

      expect(response[1][0].receptacleId).toBe('');
      expect(response[1][1].receptacleId).toBe('');
      expect(response[1][2].receptacleId).toBe('');
      expect(response[1][3].receptacleId).toBe('');
    });
  });
  describe('tests for parallel duplicates', () => {
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
        ParallelDuplicates_rate: 100, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
      };
    });
    test('make sure the EMA messages are on the same day and are identical', async () => {
      expect.assertions(4);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      const {
        packageId: packageId1,
        packageType: packageType1,
        lastUpdated: lastUpdated1,
      } = response[0][0];
      const {
        packageId: packageId2,
        lastUpdated: lastUpdated2,
      } = response[0][1];

      const expectedPackageId1 = new RegExp(
        `${getPackageTypeCode(packageType1)}5555[0-9]{5}${origin}`,
      );

      expect(response[0].length).toBe(2); // two packages should be created
      expect(packageId1).toMatch(packageId2); // the packageIds should be the same
      expect(packageId1).toMatch(expectedPackageId1);
      expect(lastUpdated1.toDateString()).toMatch(lastUpdated2.toDateString());
    });
    test('confirm that both messages have the different receptacle and dispatchIds, but EMC occurs on the same day', async () => {
      expect.assertions(8);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      // get the EMC/PREDES messages
      const emcs = response[1].filter(message =>
        shipmentStatuses[2].includes(message.shipmentStatus),
      );
      const {
        receptacleId: receptacleId1,
        dispatchId: dispatchId1,
        packageId: packageId1,
        lastUpdated: lastUpdated1,
      } = emcs[0];
      const {
        receptacleId: receptacleId2,
        dispatchId: dispatchId2,
        packageId: packageId2,
        lastUpdated: lastUpdated2,
      } = emcs[1];

      const getDestinationAirportRegex = `${origin}[A-Za-z]{4}${destination}([A-Za-z]{4})`;
      const destAirport1 = dispatchId1.match(getDestinationAirportRegex);
      const destAirport2 = dispatchId2.match(getDestinationAirportRegex);

      expect(emcs.length).toBe(2); // only two packages should have been created
      expect(getAirportArray(destination)).toContain(destAirport1);
      expect(getAirportArray(destination)).toContain(destAirport2); // airports should be valid
      expect(destAirport1).not.toMatch(destAirport2); // destination airports should be different
      expect(receptacleId1).not.toMatch(receptacleId2);
      expect(dispatchId1).not.toMatch(dispatchId2);
      expect(packageId1).toMatch(packageId2);
      expect(lastUpdated1).toEqual(lastUpdated2); // may need to clean up date formats here..
    });
    test('confirm that both packages are delivered on the same day', async () => {
      expect.assertions(5);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the delivery messages
      const deliveryScans = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      expect(deliveryScans.length).toBe(2);

      const {
        receptacleId: receptacleId1,
        dispatchId: dispatchId1,
        packageId: packageId1,
        lastUpdated: lastUpdated1,
      } = deliveryScans[0];
      const {
        receptacleId: receptacleId2,
        dispatchId: dispatchId2,
        packageId: packageId2,
        lastUpdated: lastUpdated2,
      } = deliveryScans[1];

      expect(receptacleId1).not.toMatch(receptacleId2);
      expect(dispatchId1).not.toMatch(dispatchId2);
      expect(packageId1).toMatch(packageId2);
      expect(lastUpdated1).toEqual(lastUpdated2); // may need to clean up date formats here..
    });
  });
  describe('tests for sequential duplicates', () => {
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 100, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
      };
    });
    test('make sure the EMA messages are on different days but packageId is same', async () => {
      expect.assertions(4);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response[0].length).toBe(2); // two packages should be created
      const {
        packageId: packageId1,
        packageType: packageType1,
        lastUpdated: lastUpdated1,
      } = response[0][0];
      const {
        packageId: packageId2,
        lastUpdated: lastUpdated2,
      } = response[0][1];
      expect(packageId1).toMatch(packageId2); // the packageIds should be the same
      const expectedPackageId1 = new RegExp(
        `${getPackageTypeCode(packageType1)}6666[0-9]{5}${origin}`,
      );
      expect(packageId1).toMatch(expectedPackageId1);
      expect(lastUpdated1).not.toEqual(lastUpdated2);
    });
    test('confirm that both messages have the different receptacle and dispatchIds, and EMC occurs on different day', async () => {
      expect.assertions(8);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      // get the EMC/PREDES messages
      const emcs = response[1].filter(message =>
        shipmentStatuses[2].includes(message.shipmentStatus),
      );
      expect(emcs.length).toBe(2); // only two packages should have been created
      const {
        receptacleId: receptacleId1,
        dispatchId: dispatchId1,
        packageId: packageId1,
        lastUpdated: lastUpdated1,
      } = emcs[0];
      const {
        receptacleId: receptacleId2,
        dispatchId: dispatchId2,
        packageId: packageId2,
        lastUpdated: lastUpdated2,
      } = emcs[1];

      const getDestinationAirportRegex = `${origin}[A-Za-z]{4}${destination}([A-Za-z]{4})`;
      const destAirport1 = dispatchId1.match(getDestinationAirportRegex)[1];
      const destAirport2 = dispatchId2.match(getDestinationAirportRegex)[1];

      expect(getAirportArray(destination).includes(destAirport1)).toBeTruthy();
      expect(getAirportArray(destination).includes(destAirport2)).toBeTruthy(); // airports should be valid
      expect(destAirport1).not.toMatch(destAirport2); // destination airports should be different
      expect(receptacleId1).not.toMatch(receptacleId2);
      expect(dispatchId1).not.toMatch(dispatchId2);
      expect(packageId1).toMatch(packageId2);
      expect(lastUpdated1).not.toEqual(lastUpdated2); // may need to clean up date formats here..
    });
    test('confirm that both packages are delivered on different days', async () => {
      expect.assertions(5);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the delivery messages
      const deliveryScans = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      expect(deliveryScans.length).toBe(2);

      const {
        receptacleId: receptacleId1,
        dispatchId: dispatchId1,
        packageId: packageId1,
        lastUpdated: lastUpdated1,
      } = deliveryScans[0];
      const {
        receptacleId: receptacleId2,
        dispatchId: dispatchId2,
        packageId: packageId2,
        lastUpdated: lastUpdated2,
      } = deliveryScans[1];

      expect(receptacleId1).not.toMatch(receptacleId2);
      expect(dispatchId1).not.toMatch(dispatchId2);
      expect(packageId1).toMatch(packageId2);
      expect(lastUpdated1).not.toEqual(lastUpdated2); // may need to clean up date formats here..
    });
    test('confirm that the first package is fully delivered before the second package is created', async () => {
      expect.assertions(2);

      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the delivery messages
      const deliveryScans = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      expect(deliveryScans.length).toBe(2);

      // may need to validate that the timestamps can be compared with > or <
      const { lastUpdated: creationDate1 } = response[0][0];
      const { lastUpdated: creationDate2 } = response[0][1];
      const { lastUpdated: deliveryDate1 } = deliveryScans[0];
      const { lastUpdated: deliveryDate2 } = deliveryScans[1];

      expect(
        creationDate1 > deliveryDate2 || creationDate2 > deliveryDate1,
      ).toBeTruthy();
    });
  });
  describe('tests for exact duplicates', () => {
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 100, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
      };
    });
    test('make sure the EMA messages have the same packageId packageId', async () => {
      expect.assertions(3);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response[0].length).toBe(2); // two packages should be created
      const {
        packageId: packageId1,
        packageType: packageType1,
      } = response[0][0];
      const { packageId: packageId2 } = response[0][1];
      expect(packageId1).toMatch(packageId2); // the packageIds should be the same
      const expectedPackageId1 = new RegExp(
        `${getPackageTypeCode(packageType1)}7777[0-9]{5}${origin}`,
      );
      expect(packageId1).toMatch(expectedPackageId1);
    });
    test('make sure all of the messages are the exact same', async () => {
      expect.assertions(11);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response[0].length).toBe(2); // two packages should be created
      expect(response[1].length).toBe(16); // all scans should be present

      // EMA messages should be identical
      expect(response[0][0]).toEqual(response[0][1]);

      // get the EXA messages
      const exa = response[1].filter(message =>
        shipmentStatuses[0].includes(message.shipmentStatus),
      );
      expect(exa[0]).toEqual(exa[1]);

      // get the exc messages
      const exc = response[1].filter(message =>
        shipmentStatuses[1].includes(message.shipmentStatus),
      );
      expect(exc[0]).toEqual(exc[1]);

      // get the emc/predes messages
      const emc = response[1].filter(message =>
        shipmentStatuses[2].includes(message.shipmentStatus),
      );
      expect(emc[0]).toEqual(emc[1]);

      // get the resdes/emd messages
      const emd = response[1].filter(message =>
        shipmentStatuses[3].includes(message.shipmentStatus),
      );
      expect(emd[0]).toEqual(emd[1]);

      // get the eda messages
      const eda = response[1].filter(message =>
        shipmentStatuses[4].includes(message.shipmentStatus),
      );
      expect(eda[0]).toEqual(eda[1]);

      // get the edc messages
      const edc = response[1].filter(message =>
        shipmentStatuses[5].includes(message.shipmentStatus),
      );
      expect(edc[0]).toEqual(edc[1]);

      // get the pre-delivery messages
      const preDeliveryScans = response[1].filter(message =>
        shipmentStatuses[6].includes(message.shipmentStatus),
      );
      expect(preDeliveryScans[0]).toEqual(preDeliveryScans[1]);

      // get the delivery messages
      const deliveryScans = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      expect(deliveryScans[0]).toEqual(deliveryScans[1]);
    });
  });
  describe('tests for PREDES only at Origin', () => {
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 100, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
      };
    });
    test('make sure packageId has correct format', async () => {
      expect.assertions(3);

      // we have 1 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId, packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}8888[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);
    });
    test('make sure only EMA, EMB, and EMC/PREDES messages exist', async () => {
      expect.assertions(4);

      // we have 1 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0].length).toBe(1); // only expect 1 package
      expect(response[1].length).toBe(3); // two scans to update the package
      expect(response[1][0].shipmentStatus).toMatch('EMB');
      expect(response[1][1].shipmentStatus).toMatch('EMC');
      expect(response[1][2].shipmentStatus).toMatch('PREDES');
    });
    test('make sure package ends as unreconciled', async () => {
      expect.assertions(1);

      // we have 1 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      const updatesLength = response[1].length;

      expect(response[1][updatesLength - 1].settlementStatus).toMatch(
        'Unreconciled',
      );
    });
  });
  describe('tests for Multiple PREDES (10 then 9 items)', () => {
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 100, // over 100 %
        ItemsInDifferentReceptacle: 0, // over 100%
      };
    });
    test('make sure packageId has correct format', async () => {
      expect.assertions(1);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId, packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}9999[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);
    });
    test('test that 10 packages are created', async () => {
      expect.assertions(1);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0].length).toBe(10); // we expect 10 packages to be created (i.e. have an EMA)
    });
    test('test the flow -> that all 10 packages have a EMB, EMC, and first PREDES scans, but only 9 have second PREDES and destination scans', async () => {
      expect.assertions(9);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response[1].length).toBe(84); // all scans should be present

      /**
       * @Edu I know this flow of packages is different than the rest of patches.
       * We can discuss if this change become overly difficult to include.
       */
      // get the EMB messages
      const emb = response[1].filter(
        message => message.shipmentStatus === 'EMB',
      );
      expect(emb.length).toBe(10);

      // get the EMC messages
      const emc = response[1].filter(
        message => message.shipmentStatus === 'EMC',
      );
      expect(emc.length).toBe(10);

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );
      expect(predes.length).toBe(19); // nine of the package should have 2 PREDES scans

      // After second PREDES only 9 packages continue
      // get the resdes/emd messages
      const emd = response[1].filter(message =>
        shipmentStatuses[3].includes(message.shipmentStatus),
      );
      expect(emd.length).toBe(9);

      // get the eda messages
      const eda = response[1].filter(message =>
        shipmentStatuses[4].includes(message.shipmentStatus),
      );
      expect(eda.length).toBe(9);

      // get the edc messages
      const edc = response[1].filter(message =>
        shipmentStatuses[5].includes(message.shipmentStatus),
      );
      expect(edc.length).toBe(9);

      // get the pre-delivery messages
      const preDeliveryScans = response[1].filter(message =>
        shipmentStatuses[6].includes(message.shipmentStatus),
      );
      expect(preDeliveryScans.length).toBe(9);

      // get the delivery messages
      const deliveryScans = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      expect(deliveryScans.length).toBe(9);
    });
    test('test that only 1 package did not get the second predes scan', async () => {
      expect.assertions(3);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );

      const { receptacleId: receptacleId1 } = predes[0];
      const predes1 = predes.filter(
        message => message.receptacleId === receptacleId1,
      );
      const predes2 = predes.filter(
        message => message.receptacleId !== receptacleId1,
      );
      const predes2PackageIds = predes2.map(msg => msg.packageId);
      const forgottenPackages = predes1.filter(
        message => !predes2PackageIds.includes(message.packageId),
      );
      expect(predes2.length).toBe(9);
      expect(predes1.length).toBe(10);
      expect(forgottenPackages.length).toBe(1);
    });
    test('test that the package that did not get the second predes scan does not get any more scans', async () => {
      expect.assertions(5);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );

      const { receptacleId: receptacleId1 } = predes[0];
      const predes1 = predes.filter(
        message => message.receptacleId === receptacleId1,
      );
      const predes2 = predes.filter(
        message => message.receptacleId !== receptacleId1,
      );
      const predes2PackageIds = predes2.map(msg => msg.packageId);

      const forgottenPackageId = predes1.filter(
        message => !predes2PackageIds.includes(message.packageId),
      )[0].packageId;

      // get the resdes/emd message packageIds
      const emdPackageIds = response[1]
        .filter(message => shipmentStatuses[3].includes(message.shipmentStatus))
        .map(message => message.packageId);

      // get the eda message packageIds
      const edaPackageIds = response[1]
        .filter(message => shipmentStatuses[4].includes(message.shipmentStatus))
        .map(message => message.packageId);

      // get the edc message packageIds
      const edcPackageIds = response[1]
        .filter(message => shipmentStatuses[5].includes(message.shipmentStatus))
        .map(message => message.packageId);

      // get the pre-delivery message pacakgeIds
      const preDeliveryPackageIds = response[1]
        .filter(message => shipmentStatuses[6].includes(message.shipmentStatus))
        .map(message => message.packageId);

      // get the delivery message pacakgeIds
      const deliveryPackageIds = response[1]
        .filter(message => shipmentStatuses[7].includes(message.shipmentStatus))
        .map(message => message.packageId);

      expect(emdPackageIds).not.toContain(forgottenPackageId);
      expect(edaPackageIds).not.toContain(forgottenPackageId);
      expect(edcPackageIds).not.toContain(forgottenPackageId);
      expect(preDeliveryPackageIds).not.toContain(forgottenPackageId);
      expect(deliveryPackageIds).not.toContain(forgottenPackageId);
    });
    test('test that the packages that did get the second predes scan have a new receptacleId and dispatchId', async () => {
      expect.assertions(7);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );

      const {
        receptacleId: receptacleId1,
        dispatchId: dispatchId1,
      } = predes[0];
      const predes2 = predes.find(
        message => message.receptacleId !== receptacleId1,
      );
      const { receptacleId: receptacleId2, dispatchId: dispatchId2 } = predes2;

      // get the resdes/emd message packageIds
      const emd = response[1].filter(message =>
        shipmentStatuses[3].includes(message.shipmentStatus),
      );
      const emdDifferentIds = emd.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );

      // get the eda message packageIds
      const eda = response[1].filter(message =>
        shipmentStatuses[4].includes(message.shipmentStatus),
      );
      const edaDifferentIds = eda.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );

      // get the edc message packageIds
      const edc = response[1].filter(message =>
        shipmentStatuses[5].includes(message.shipmentStatus),
      );
      const edcDifferentIds = edc.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );

      // get the pre-delivery message pacakgeIds
      const preDelivery = response[1].filter(message =>
        shipmentStatuses[6].includes(message.shipmentStatus),
      );
      const preDeliveryDifferentIds = preDelivery.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );

      // get the delivery message pacakgeIds
      const delivery = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      const deliveryDifferentIds = delivery.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );

      expect(dispatchId1).not.toMatch(dispatchId2);
      expect(receptacleId1).not.toMatch(receptacleId2);
      expect(emdDifferentIds.length).toBe(0);
      expect(edaDifferentIds.length).toBe(0);
      expect(edcDifferentIds.length).toBe(0);
      expect(preDeliveryDifferentIds.length).toBe(0);
      expect(deliveryDifferentIds.length).toBe(0);
    });
    test('test that the packages that did get the second predes scan end up as reconciled', async () => {
      expect.assertions(2);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the delivery message pacakgeIds
      const delivery = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      const reconciled = delivery.filter(
        message => message.settlementStatus === 'Reconciled',
      );

      expect(delivery.length).toBe(9);
      expect(reconciled.length).toBe(9);
    });
  });
  describe('tests for Items in a Different Receptacle PREDES', () => {
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
        ParallelDuplicates_rate: 0, // over 100 %
        SequentialDuplicates_rate: 0, // over 100 %
        ExactDuplicates_rate: 0, // over 100 %
        PreDesOnly: 0, // over 100 %
        MultiplePreDes: 0, // over 100 %
        ItemsInDifferentReceptacle: 100, // over 100%
      };
    });
    test('make sure packageId has correct format', async () => {
      expect.assertions(1);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      const [[{ packageId, packageType }]] = response;
      const expectedPackageId = new RegExp(
        `${getPackageTypeCode(packageType)}0000[0-9]{5}${origin}`,
      );
      expect(packageId).toMatch(expectedPackageId);
    });
    test('test that 10 packages are created', async () => {
      expect.assertions(1);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      expect(response[0].length).toBe(10); // we expect 10 packages to be created (i.e. have an EMA)
    });
    test('test the flow -> that all 10 packages have a EMB, EMC, and destination scans. 5 should have another PREDES scan', async () => {
      expect.assertions(9);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );
      expect(response[1].length).toBe(85); // all scans should be present

      /**
       * @Edu I know this flow of packages is different than the rest of patches.
       * We can discuss if this change become overly difficult to include.
       */
      // get the EMB messages
      const emb = response[1].filter(
        message => message.shipmentStatus === 'EMB',
      );
      expect(emb.length).toBe(10);

      // get the EMC messages
      const emc = response[1].filter(
        message => message.shipmentStatus === 'EMC',
      );
      expect(emc.length).toBe(10);

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );
      expect(predes.length).toBe(15); // nine of the package should have 2 PREDES scans

      // After second PREDES only 9 packages continue
      // get the resdes/emd messages
      const emd = response[1].filter(message =>
        shipmentStatuses[3].includes(message.shipmentStatus),
      );
      expect(emd.length).toBe(10);

      // get the eda messages
      const eda = response[1].filter(message =>
        shipmentStatuses[4].includes(message.shipmentStatus),
      );
      expect(eda.length).toBe(10);

      // get the edc messages
      const edc = response[1].filter(message =>
        shipmentStatuses[5].includes(message.shipmentStatus),
      );
      expect(edc.length).toBe(10);

      // get the pre-delivery messages
      const preDeliveryScans = response[1].filter(message =>
        shipmentStatuses[6].includes(message.shipmentStatus),
      );
      expect(preDeliveryScans.length).toBe(10);

      // get the delivery messages
      const deliveryScans = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      expect(deliveryScans.length).toBe(10);
    });
    test('5 packages did not get the second predes scan', async () => {
      expect.assertions(3);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );

      const { receptacleId: receptacleId1 } = predes[0];
      const predes1 = predes.filter(
        message => message.receptacleId === receptacleId1,
      );
      const predes2 = predes.filter(
        message => message.receptacleId !== receptacleId1,
      );
      const predes2PackageIds = predes2.map(msg => msg.packageId);
      const forgottenPackages = predes1.filter(
        message => !predes2PackageIds.includes(message.packageId),
      );
      expect(predes2.length).toBe(5);
      expect(predes1.length).toBe(10);
      expect(forgottenPackages.length).toBe(5);
    });
    test('test that the packages that did not get the second predes scan still get destination scans', async () => {
      expect.assertions(5);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );

      const { receptacleId: receptacleId1 } = predes[0];

      // get the resdes/emd messages
      const emd = response[1]
        .filter(message => shipmentStatuses[3].includes(message.shipmentStatus))
        .filter(message => message.receptacleId === receptacleId1);

      // get the eda messages
      const eda = response[1]
        .filter(message => shipmentStatuses[4].includes(message.shipmentStatus))
        .filter(message => message.receptacleId === receptacleId1);

      // get the edc messages
      const edc = response[1]
        .filter(message => shipmentStatuses[5].includes(message.shipmentStatus))
        .filter(message => message.receptacleId === receptacleId1);

      // get the pre-delivery messages
      const preDelivery = response[1]
        .filter(message => shipmentStatuses[6].includes(message.shipmentStatus))
        .filter(message => message.receptacleId === receptacleId1);

      // get the delivery messages
      const delivery = response[1]
        .filter(message => shipmentStatuses[7].includes(message.shipmentStatus))
        .filter(message => message.receptacleId === receptacleId1);

      expect(emd.length).toBe(5);
      expect(eda.length).toBe(5);
      expect(edc.length).toBe(5);
      expect(preDelivery.length).toBe(5);
      expect(delivery.length).toBe(5);
    });
    test('test that the packages that did get the second predes scan have a new receptacleId and dispatchId', async () => {
      expect.assertions(12);

      // we have 2 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the PREDES messages
      const predes = response[1].filter(
        message => message.shipmentStatus === 'PREDES',
      );

      const {
        receptacleId: receptacleId1,
        dispatchId: dispatchId1,
      } = predes[0];
      const predes2 = predes.find(
        message => message.receptacleId !== receptacleId1,
      );
      const { receptacleId: receptacleId2, dispatchId: dispatchId2 } = predes2;

      // get the resdes/emd messages
      const emd = response[1].filter(message =>
        shipmentStatuses[3].includes(message.shipmentStatus),
      );
      const emdDifferentIds = emd.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );
      const emdSameIds = emd.filter(
        message =>
          message.dispatchId === dispatchId2 ||
          message.receptacleId === receptacleId2,
      );

      // get the eda messages
      const eda = response[1].filter(message =>
        shipmentStatuses[4].includes(message.shipmentStatus),
      );
      const edaDifferentIds = eda.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );
      const edaSameIds = eda.filter(
        message =>
          message.dispatchId === dispatchId2 ||
          message.receptacleId === receptacleId2,
      );

      // get the edc messages
      const edc = response[1].filter(message =>
        shipmentStatuses[5].includes(message.shipmentStatus),
      );
      const edcDifferentIds = edc.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );
      const edcSameIds = edc.filter(
        message =>
          message.dispatchId === dispatchId2 ||
          message.receptacleId === receptacleId2,
      );

      // get the pre-delivery messages
      const preDelivery = response[1].filter(message =>
        shipmentStatuses[6].includes(message.shipmentStatus),
      );
      const preDeliveryDifferentIds = preDelivery.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );
      const preDeliverySameIds = preDelivery.filter(
        message =>
          message.dispatchId === dispatchId2 ||
          message.receptacleId === receptacleId2,
      );

      // get the delivery messages
      const delivery = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      const deliveryDifferentIds = delivery.filter(
        message =>
          message.dispatchId !== dispatchId2 ||
          message.receptacleId !== receptacleId2,
      );
      const deliverySameIds = delivery.filter(
        message =>
          message.dispatchId === dispatchId2 ||
          message.receptacleId === receptacleId2,
      );

      expect(dispatchId1).not.toMatch(dispatchId2);
      expect(receptacleId1).not.toMatch(receptacleId2);
      expect(emdSameIds.length).toBe(5);
      expect(edaSameIds.length).toBe(5);
      expect(edcSameIds.length).toBe(5);
      expect(preDeliverySameIds.length).toBe(5);
      expect(deliverySameIds.length).toBe(5);
      expect(emdDifferentIds.length).toBe(5);
      expect(edaDifferentIds.length).toBe(5);
      expect(edcDifferentIds.length).toBe(5);
      expect(preDeliveryDifferentIds.length).toBe(5);
      expect(deliveryDifferentIds.length).toBe(5);
    });
    test('test that all packages end up as reconciled', async () => {
      expect.assertions(2);

      // we have 10 packages being created in our simulation
      const response = await simulator.simulate(
        'small',
        origin,
        destination,
        '04/01/2018',
        '06/30/2018',
      );

      // get the delivery message pacakgeIds
      const delivery = response[1].filter(message =>
        shipmentStatuses[7].includes(message.shipmentStatus),
      );
      const reconciled = delivery.filter(
        message => message.settlementStatus === 'Reconciled',
      );

      expect(delivery.length).toBe(10);
      expect(reconciled.length).toBe(10);
    });
  });
});

/* @flow */

import config from '../config';
import logger from '../logger';
import postal from './postal';

// define random values
const PackageType = ['LA', 'CA', 'EX', 'UA', 'RA']; // tracked,parcels,express,untracked,registered
const Countrys = ['US', 'CN', 'GB', 'DE', 'CA', 'JP', 'FR'];
const AirportsUS = ['JFKA'];
const AirportsCN = ['BJSA'];
const AirportsUK = ['LONA', 'CVTA'];
const AirportsDE = ['FRAA'];
const AirportsCA = ['YTOA'];
const AirportsJP = ['TYOA'];
const AirportsFR = ['CDGA'];

const lostpackagestatus = [1, 2, 4, 6, 9, 10, 12, 14]; // possible status for lost packages

// random value of array
function randomArray(items) {
  return items[Math.floor(items.length * Math.random())];
}

// random number with return string zero complete
function randomNumber(long) {
  let maxnum = 1;
  for (let i = 0; i < long; i += 1) {
    maxnum *= 10;
  }
  let randNum = Math.floor(Math.random() * (maxnum + 1)).toString();
  while (randNum.length < long) {
    randNum = `0${randNum}`;
  }
  return randNum;
}

// return package ID
function generatepackage(country, packagetype, typeofpatch) {
  let ninecharnum;
  if (typeofpatch === 'receivedExcess') {
    ninecharnum = `1111${randomNumber(5)}`;
  } else if (typeofpatch === 'lostParcel') {
    ninecharnum = `2222${randomNumber(5)}`;
  } else if (typeofpatch === 'seizedorReturned') {
    ninecharnum = `3333${randomNumber(5)}`;
  } else if (typeofpatch === 'nopredes') {
    ninecharnum = `4444${randomNumber(5)}`;
  } else {
    ninecharnum = randomNumber(9);
  }
  return packagetype + ninecharnum + country;
}

// return a value between Min and Max (Kg Format)
function randomWeight(min, max) {
  return parseInt((Math.random() * (max - min) + min) * 10, 10) / 10;
}

// return package name
function getPackageParams(packagetype) {
  let packagename;
  let weight;
  if (packagetype === 'L') {
    packagename = 'Tracked Packet';
    weight = randomWeight(0.1, 1.99);
  }
  if (packagetype === 'C') {
    packagename = 'Parcels';
    weight = randomWeight(2, 10);
  }
  if (packagetype === 'E') {
    packagename = 'Express';
    weight = randomWeight(2, 10);
  }
  if (packagetype === 'U') {
    packagename = 'Untracked Packets';
    weight = randomWeight(0.1, 1.99);
  }
  if (packagetype === 'R') {
    packagename = 'Registered';
    weight = randomWeight(0.1, 1.99);
  }
  return [packagename, weight];
}

// return a date with define format and random hour/minute
function dateformat(datestatus, daytime?) {
  let month = datestatus.getMonth().toString();
  while (month.length < 2) {
    month = `0${month}`;
  }
  let day = datestatus.getDate().toString();
  while (day.length < 2) {
    day = `0${day}`;
  }
  let hour;
  if (daytime) {
    // from 8am to 19pm
    hour = Math.floor(Math.random() * (20 - 8) + 8).toString();
  } else {
    // from 0am to 23pm
    hour = Math.floor(Math.random() * 24 + 0).toString();
  }
  while (hour.length < 2) {
    hour = `0${hour}`;
  }
  let minutes = Math.floor(Math.random() * 59 + 0).toString();
  while (minutes.length < 2) {
    minutes = `0${minutes}`;
  }
  return new Date(datestatus.getFullYear(), month, day, hour, minutes, 0, 0);
}

// return the Dispatch ID
function generatedispatch(origin, destination, packagetype) {
  const actualYear = new Date()
    .getFullYear()
    .toString()
    .substring(3, 4);
  let originAirport = '  ';
  let destinationAirport = '  ';

  if (origin === 'US') {
    originAirport = randomArray(AirportsUS);
  }
  if (origin === 'CN') {
    originAirport = randomArray(AirportsCN);
  }
  if (origin === 'UK') {
    originAirport = randomArray(AirportsUK);
  }
  if (origin === 'DE') {
    originAirport = randomArray(AirportsDE);
  }
  if (origin === 'CA') {
    originAirport = randomArray(AirportsCA);
  }
  if (origin === 'JP') {
    originAirport = randomArray(AirportsJP);
  }
  if (origin === 'FR') {
    originAirport = randomArray(AirportsFR);
  }

  if (destination === 'US') {
    destinationAirport = randomArray(AirportsUS);
  }
  if (destination === 'CN') {
    destinationAirport = randomArray(AirportsCN);
  }
  if (destination === 'UK') {
    destinationAirport = randomArray(AirportsUK);
  }
  if (destination === 'DE') {
    destinationAirport = randomArray(AirportsDE);
  }
  if (destination === 'CA') {
    destinationAirport = randomArray(AirportsCA);
  }
  if (destination === 'JP') {
    destinationAirport = randomArray(AirportsJP);
  }
  if (destination === 'FR') {
    destinationAirport = randomArray(AirportsFR);
  }

  return `${origin +
    originAirport +
    destination +
    destinationAirport}A${packagetype}${actualYear}${randomNumber(4)}`;
}

// return the receipt ID
function generatereceipt(dispatch, weight, receptacleSerialNum) {
  const finalbag = randomArray([0, 1, 9]);
  let weightstring = parseInt(weight * 10, 10).toString();
  while (weightstring.length < 4) {
    // fill 4 char with zeros
    weightstring = `0${weightstring}`;
  }
  return `${dispatch + receptacleSerialNum + finalbag}0${weightstring}`;
}

// return the packageUUID
function generateUUID() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i += 1) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] && 0x3) || 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  const uuid = s.join('');
  return uuid;
}

// return the different status from a package and the date status
function generatestatus(step, datestatus, typeofpatch, randomreceivedExcess) {
  let actualStatus = [''];
  switch (step) {
    default:
      actualStatus = ['EMA']; // Posting / Collection
      break;
    case 0:
      if (typeofpatch !== 'receivedExcess') {
        actualStatus = ['EMA']; // Posting / Collection
      }
      datestatus.setDate(datestatus.getDate() + config.simulate.days[0]);
      break;
    case 1:
      //     if (typeofpatch !== 'receivedExcess') {
      //         actualStatus = ['EMB']; // Arrival at outward OE
      //     }
      // datestatus.setDate(datestatus.getDate() + config.simulate.days[1]);
      break;
    case 2:
      if (typeofpatch !== 'receivedExcess') {
        actualStatus = ['EXA']; // EXA Item presented to export customs
      }
      datestatus.setDate(datestatus.getDate() + config.simulate.days[1]);
      break;
    case 3:
      if (typeofpatch !== 'receivedExcess') {
        if (typeofpatch === 'seizedorReturned' && randomreceivedExcess === 0) {
          actualStatus = ['EXB']; // RETENIDO: EXB Item held by export customs
          datestatus.setDate(datestatus.getDate() + 1);
        }
      }
      break;
    case 4:
      if (typeofpatch !== 'receivedExcess') {
        actualStatus = ['EXC']; // Item returned from customs
      }
      datestatus.setDate(datestatus.getDate() + config.simulate.days[2]);
      break;
    case 5:
      if (typeofpatch !== 'receivedExcess') {
        if (typeofpatch === 'seizedorReturned' && randomreceivedExcess === 1) {
          actualStatus = ['EXX']; // cancelation or terminated , status 0 to 3
          datestatus.setDate(datestatus.getDate() + 1);
        }
      }
      break;
    case 6:
      if (typeofpatch !== 'receivedExcess' && typeofpatch !== 'nopredes') {
        // begin directdespatch status - Operator of transits
        actualStatus = ['EMC', 'PREDES']; // Left Origin (Originally called Item Left)
      }
      datestatus.setDate(datestatus.getDate() + config.simulate.days[3]);
      break;
    case 7:
      // actualStatus = ['EMJ','EMK']; // Left Origin (Originally called Item Left)
      break;
    case 8:
      actualStatus = ['EMD', 'RESDES']; // Arrive Destination Post (Receipt Scan)
      datestatus.setDate(datestatus.getDate() + config.simulate.days[4]);
      break;
    case 9:
      actualStatus = ['EDA', 'EDB']; // Into Customs
      datestatus.setDate(datestatus.getDate() + config.simulate.days[5]);
      break;
    case 10:
      if (typeofpatch === 'seizedorReturned' && randomreceivedExcess === 2) {
        actualStatus = ['EME']; // RETENIDO: Handed over to customs
        datestatus.setDate(datestatus.getDate() + 1);
      }
      break;
    case 11:
      actualStatus = ['EDC']; // Out of Customs
      datestatus.setDate(datestatus.getDate() + config.simulate.days[6]);
      break;
    case 12:
      actualStatus = ['EMF', 'EDD', 'EDE']; // Domestic process
      datestatus.setDate(datestatus.getDate() + config.simulate.days[7]);
      break;
    case 13:
      if (typeofpatch === 'seizedorReturned' && randomreceivedExcess === 3) {
        actualStatus = ['EDX']; // cancelation or terminated , status 4 to 6
        datestatus.setDate(datestatus.getDate() + 1);
      }
      break;
    case 14:
      actualStatus = ['EMG', 'EDF', 'EDG', 'EDH', 'EMH', 'EMI']; // Delivery
      datestatus.setDate(datestatus.getDate() + config.simulate.days[8]);
      break;
  }
  return [randomArray(actualStatus), datestatus];
}

// return EDI message
function generateEDI(
  packageid,
  dispatch,
  receptacle,
  packagename,
  packageuuid,
  origin,
  destination,
  originreceptacle,
  settlementstatus,
  weight,
  status,
  deliverybyday,
) {
  const datestatus = dateformat(status[1], deliverybyday);
  const MockEDI = {
    packageId: packageid,
    dispatchId: dispatch,
    receptacleId: receptacle,
    packageUUID: packageuuid,
    originCountry: origin,
    destinationCountry: destination,
    settlementStatus: settlementstatus,
    weight,
    packageType: packagename,
    shipmentStatus: status[0],
    lastUpdated: datestatus,
  };
  return MockEDI;
}

function rateArray(numpackages, ratepackages) {
  const ratearray = [];
  let lastnumber = ratepackages;
  for (let a = 1; a < numpackages / 50; a += 1) {
    const ratepercent = Math.round(ratepackages / (numpackages / 50));
    ratearray.push(ratepercent);
    lastnumber -= ratepercent;
  }
  ratearray.push(lastnumber);
  return ratearray;
}

// eslint-disable-next-line func-names
Promise.settle = function(promises) {
  return Promise.all(
    promises.map(p =>
      // make sure any values or foreign promises are wrapped in a promise
      Promise.resolve(p).catch(err => {
        // make sure error is wrapped in Error object so we can reliably detect which promises rejected
        if (err instanceof Error) {
          return err;
        }
        const errObject = new Error();
        errObject.rejectErr = err;
        return errObject;
      }),
    ),
  );
};

const updateProcessStep = async (messages: []): Promise<any> => {
  const allPromises = [];
  logger.debug(
    `Set of process step messages: ${JSON.stringify(messages, null, 2)}`,
  );
  messages.forEach(message => {
    allPromises.push(postal.updateShipmentStatus(message));
  });
  return Promise.settle(allPromises);
};

class DispatchSimulator {
  simulate = (
    size: string,
    origin: string,
    destination: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> => {
    let repeatpackage = 1;
    if (size === 'large') {
      repeatpackage = config.simulate.size.large;
    } else if (size === 'medium') {
      repeatpackage = config.simulate.size.medium;
    } else {
      repeatpackage = config.simulate.size.small;
    }

    let EDIorigin = origin;
    let EDIdestination = destination;
    if (!Countrys.includes(EDIorigin)) {
      EDIorigin = randomArray(Countrys);
    } // generate random country if dont exists.
    if (!Countrys.includes(EDIdestination)) {
      EDIdestination = randomArray(Countrys);
    } // generate random country if dont exists.

    logger.info(
      `--->Sending Size: ${size}  ${repeatpackage} packages, from ${EDIorigin} to ${EDIdestination}`,
    );
    const EDICreatePackage = [];
    const EDIUpdatePackage = [];

    let EDIpackagetype = randomArray(PackageType);
    let EDIdispatchid = generatedispatch(
      EDIorigin,
      EDIdestination,
      EDIpackagetype,
    );

    const rateNumOfRecInExcess = Math.round(
      (repeatpackage * config.simulate.ReceivedinExcess_rate) / 100,
    );
    const NumOfRecInExcessArray = rateArray(
      repeatpackage,
      rateNumOfRecInExcess,
    );
    logger.info(
      ` Packets with rate NumOfRecInExcess      ${rateNumOfRecInExcess} - ${NumOfRecInExcessArray}`,
    );
    const rateNumOfLostParcel = Math.round(
      (repeatpackage * config.simulate.LostParcel_rate) / 100,
    );
    const LostParcelArray = rateArray(repeatpackage, rateNumOfLostParcel);
    logger.info(
      ` Packets with rate NumOfLostParcel       ${rateNumOfLostParcel} - ${LostParcelArray}`,
    );
    const rateNumOfSeizedorReturned = Math.round(
      (repeatpackage * config.simulate.SeizedorReturned_rate) / 100,
    );
    const SeizedorReturnedArray = rateArray(
      repeatpackage,
      rateNumOfSeizedorReturned,
    );
    logger.info(
      ` Packets with rate NumOfSeizedorReturned ${rateNumOfSeizedorReturned} - ${SeizedorReturnedArray}`,
    );
    const rateNumOfNoPreDes = Math.round(
      (repeatpackage * config.simulate.NoPreDes_rate) / 100,
    );
    const NoPreDesArray = rateArray(repeatpackage, rateNumOfNoPreDes);
    logger.info(
      ` Packets with rate NumOfNoPreDes         ${rateNumOfNoPreDes} - ${NoPreDesArray}`,
    );

    let receptacleSerialNum = randomNumber(3);

    // sum the array for calculate rates in each dispatch
    let countDispatch = -1;
    let sumofrates;
    let minvalue;

    // REPEAT X PACKAGE FROM SIZE
    for (let j = 0; j < repeatpackage; j += 1) {
      let i = 0;
      let countstatus = 0;

      if (j % 50 === 0) {
        countDispatch += 1;
        EDIpackagetype = randomArray(PackageType);
        // GENERATE DISPATCHID EACH 50 PACKAGEID GENERATED (with same origin, destination and package type)
        EDIdispatchid = generatedispatch(
          EDIorigin,
          EDIdestination,
          EDIpackagetype,
        );
        sumofrates =
          NumOfRecInExcessArray[countDispatch] +
          LostParcelArray[countDispatch] +
          SeizedorReturnedArray[countDispatch] +
          NoPreDesArray;
        minvalue = 50 * countDispatch;
      }
      logger.debug(`Total number of unhappy paths: ${sumofrates}`);
      // receptacles contain 10 packages so need to update serial number
      if (j % 10 === 0) {
        receptacleSerialNum = randomNumber(3);
      }
      const EDIpackageParams = getPackageParams(EDIpackagetype[0]);

      const EDIreceptacleId = generatereceipt(
        EDIdispatchid,
        EDIpackageParams[1],
        receptacleSerialNum,
      );

      // type o patch: happypatch, lost, seized or returned and received in excess
      let typeofpatch;
      if (
        minvalue <= j &&
        j < minvalue + SeizedorReturnedArray[countDispatch]
      ) {
        // Seized or Returned by Customs
        typeofpatch = 'seizedorReturned';
      } else if (
        minvalue + SeizedorReturnedArray[countDispatch] <= j &&
        j <
          minvalue +
            SeizedorReturnedArray[countDispatch] +
            LostParcelArray[countDispatch]
      ) {
        // Lost Parcel
        typeofpatch = 'lostParcel';
      } else if (
        minvalue +
          SeizedorReturnedArray[countDispatch] +
          LostParcelArray[countDispatch] <=
          j &&
        j <
          minvalue +
            SeizedorReturnedArray[countDispatch] +
            LostParcelArray[countDispatch] +
            NumOfRecInExcessArray[countDispatch]
      ) {
        // Received In Excess
        typeofpatch = 'receivedExcess';
      } else if (
        minvalue +
          SeizedorReturnedArray[countDispatch] +
          LostParcelArray[countDispatch] +
          NumOfRecInExcessArray[countDispatch] <=
          j &&
        j <
          minvalue +
            SeizedorReturnedArray[countDispatch] +
            LostParcelArray[countDispatch] +
            NumOfRecInExcessArray[countDispatch] +
            NoPreDesArray[countDispatch]
      ) {
        // No PREDES
        typeofpatch = 'nopredes';
      } else {
        typeofpatch = 'happypatch';
      }

      const EDIpackageid = generatepackage(
        EDIorigin,
        EDIpackagetype,
        typeofpatch,
      );

      // generate sum date for status
      const daysofstatus = config.simulate.days;
      let totaldaysofstatus = 0;
      for (let z = 0; z < daysofstatus.length; z += 1) {
        totaldaysofstatus += +daysofstatus[z];
      }

      // get the days of difference between start and end date
      const datestart = new Date(startDate);
      const dateend = new Date(endDate);
      const dayasmilliseconds = 86400000;
      const diffinmillisenconds = dateend - datestart;
      const diffindays =
        diffinmillisenconds / dayasmilliseconds - totaldaysofstatus;

      // get days between end date and star date (count days status)
      const randdaysinterval = Math.floor(Math.random() * (diffindays + 1));
      totaldaysofstatus += randdaysinterval;
      dateend.setDate(dateend.getDate() - totaldaysofstatus);
      // logger.info("date init: " + dateend);
      // logger.info("diffindays: " + diffindays + " random: " + randdaysinterval);

      // LOOP TO GENERATE THE DIFFERENT STATUS
      let statusfinished = false;
      let receptacleId;
      let originReceptacleId;
      const packageUUID = generateUUID();
      let dispatchId;
      let deliverybyday;
      let settlementStatus = 'Unreconciled';
      const randomreceivedExcess = Math.floor(Math.random() * 4);
      const randomlostpackage = randomArray(lostpackagestatus); // random lost status
      // let rememberhourlostpackage; //remember last date for repeat lost status

      do {
        // dispatch empty or not
        if (
          i < 4 ||
          typeofpatch === 'receivedExcess' ||
          typeofpatch === 'nopredes'
        ) {
          dispatchId = '';
          originReceptacleId = '';
        } else {
          dispatchId = EDIdispatchid;
          originReceptacleId = EDIreceptacleId;
        }
        // receptacleId empty or not
        if (
          i < 4 ||
          typeofpatch === 'receivedExcess' ||
          typeofpatch === 'nopredes'
        ) {
          receptacleId = '';
        } else {
          receptacleId = EDIreceptacleId;
        }
        // delivery by day
        if (i > 13) {
          deliverybyday = true;
        } else {
          deliverybyday = false;
        }

        // reconciled or unreconciled
        if (i === 14) {
          settlementStatus = 'Reconciled';
        } else {
          settlementStatus = 'Unreconciled';
        }

        const data = generateEDI(
          EDIpackageid,
          dispatchId,
          receptacleId,
          EDIpackageParams[0],
          packageUUID,
          EDIorigin,
          EDIdestination,
          originReceptacleId,
          settlementStatus,
          EDIpackageParams[1],
          generatestatus(i, dateend, typeofpatch, randomreceivedExcess),
          deliverybyday,
        );
        if (!statusfinished && data.shipmentStatus !== '') {
          if (i < 1 || (i === 8 && typeofpatch === 'receivedExcess')) {
            // createpackage
            EDICreatePackage.push(data);
          } else if (typeofpatch === 'lostParcel' && randomlostpackage === i) {
            // repeat the last package status with lost status
            data.shipmentStatus = 'LOST';
            if (data.lastUpdated) {
              // data.lastUpdated = rememberhourlostpackage;
              dateend.setDate(dateend.getDate() + 6); // add 7 days to lost package
              data.lastUpdated = dateformat(dateend, false);
            }
            EDIUpdatePackage.push(data);
          } else {
            // add new status
            EDIUpdatePackage.push(data);
            // rememberhourlostpackage = data.lastUpdated;
            // logger.info("actual status " + data.shipmentStatus + ' ' + typeofpatch);
          }
          countstatus += 1;
        }

        // scape from status:
        statusfinished = [
          'EMG', // Item at delivery office
          'EDF', // Item held at delivery office
          'EDG', // Item out for delivery
          'EDH', // Item arrival at collection point for pick up
          'EMH', // Attempted deliver
          'EMI', // Final delivery
          'EXX', // Seized or Returned by Customs
          'EDX', // Seized or Returned by Customs
          'EME', // Seized or Returned by Customs
          'EXB', // Seized or Returned by Customs
          'LOST', // Seized or Returned by Customs
        ].includes(data.shipmentStatus);
        if (i > '14') {
          statusfinished = true;
        } // end scape if error status
        i += 1;
      } while (!statusfinished);
      logger.debug(
        ` DISPATCHID: ${EDIdispatchid}------PACKAGEID:  ${EDIpackageid}------STATUS:  ${countstatus}  ${typeofpatch}`,
      );
    }
    // order json by time
    EDICreatePackage.sort((a, b) => {
      if (a.lastUpdated < b.lastUpdated) return -1;
      if (a.lastUpdated > b.lastUpdated) return 1;
      return 0;
    });
    EDIUpdatePackage.sort((a, b) => {
      if (a.lastUpdated < b.lastUpdated) return -1;
      if (a.lastUpdated > b.lastUpdated) return 1;
      return 0;
    });
    return [EDICreatePackage, EDIUpdatePackage];
  };

  // insert intro blockchain-createpackage one by one
  createpackage = async (
    EDImessage: [],
    startDate: Date,
    endDate: Date,
  ): Promise<any> => {
    const allPromises = [];
    logger.debug(`Dates sent to simulator are: ${startDate}, ${endDate}`);
    EDImessage.forEach(element => {
      const startDateUTC = new Date(startDate);
      const endDateUTC = new Date(endDate);
      allPromises.push(
        // to do insert in allpromises the promise with postal.createPackage(element, startDate, endDate);
        postal.createPackage(element, startDateUTC, endDateUTC),
      );
    });
    return Promise.settle(allPromises);
  };

  // insert intro blockchain-updatepackage all the status package
  updatepackage = async (EDImessage: []): Promise<any> => {
    // we need to run updateShipmentStatus separately for each update type
    // to avoid read/write errors in blockchain due to multiple requests for the same package

    // create array of messages for each shipment status step

    // Acceptance Scan (EMA) is taken care of by createPackage
    const allProcessStepArrays = [];

    const intoExports = EDImessage.filter(
      message => message.shipmentStatus === 'EXA',
    );
    allProcessStepArrays.push(intoExports);

    const outExports = EDImessage.filter(
      message => message.shipmentStatus === 'EXC',
    );
    allProcessStepArrays.push(outExports);

    const leftOrigin = EDImessage.filter(
      message =>
        message.shipmentStatus === 'EMC' || message.shipmentStatus === 'PREDES',
    );
    allProcessStepArrays.push(leftOrigin);

    const arriveDestination = EDImessage.filter(
      message =>
        message.shipmentStatus === 'RESDES' || message.shipmentStatus === 'EMD',
    );
    allProcessStepArrays.push(arriveDestination);

    const intoImport = EDImessage.filter(
      message =>
        message.shipmentStatus === 'EDA' || message.shipmentStatus === 'EDB',
    );
    allProcessStepArrays.push(intoImport);

    const outImports = EDImessage.filter(
      message => message.shipmentStatus === 'EDC',
    );
    allProcessStepArrays.push(outImports);

    const inDomestic = EDImessage.filter(
      message =>
        message.shipmentStatus === 'EMF' ||
        message.shipmentStatus === 'EDD' ||
        message.shipmentStatus === 'EDE',
    );
    allProcessStepArrays.push(inDomestic);

    const delivery = EDImessage.filter(
      message =>
        message.shipmentStatus === 'EMI' ||
        message.shipmentStatus === 'EMH' ||
        message.shipmentStatus === 'EMG' ||
        message.shipmentStatus === 'EDF' ||
        message.shipmentStatus === 'EDG' ||
        message.shipmentStatus === 'EDH',
    );
    allProcessStepArrays.push(delivery);

    const seized = EDImessage.filter(
      message =>
        message.shipmentStatus === 'EME' ||
        message.shipmentStatus === 'EXB' ||
        message.shipmentStatus === 'EDX' ||
        message.shipmentStatus === 'EXX',
    );
    allProcessStepArrays.push(seized);

    const allPromiseResults = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const processStep of allProcessStepArrays) {
      const stepPromiseResults = await updateProcessStep(processStep); // eslint-disable-line no-await-in-loop
      logger.info('Completed a process step!');
      allPromiseResults.push(stepPromiseResults);
    }

    // need to update settlement status for delivered packages
    delivery.forEach(message => {
      logger.debug('Updating settlement statuses of delivered packages');
      const payload = {
        packageId: message.packageId,
        lastUpdated: message.lastUpdated,
        newSettlementStatus: message.settlementStatus,
      };
      allPromiseResults.push(postal.updateSettlementStatus(payload));
    });
    return Promise.settle(allPromiseResults);
  };
}

export default DispatchSimulator;

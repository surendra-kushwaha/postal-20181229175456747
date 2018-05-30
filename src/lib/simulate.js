/* @flow */

import config from '../config';
import logger from '../logger';
import postal from './postal'; // eslint-disable-line no-unused-vars

// define random values
const PackageType = ['LA', 'CA', 'EX', 'UA', 'RA']; // tracked,parcels,express,untracked,registered
const Countrys = ['US', 'CN', 'UK', 'DE', 'CA', 'JP', 'FR'];
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
function generatepackage(country, packagetype) {
  return packagetype + randomNumber(9) + country;
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
  let month = (datestatus.getMonth() + 1).toString();
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
  return `${datestatus.getFullYear().toString() +
    month +
    day +
    hour +
    minutes}`;
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
function generatereceipt(dispatch, weight) {
  const finalbag = randomArray([0, 1, 9]);
  let weightstring = parseInt(weight * 10, 10).toString();
  while (weightstring.length < 4) {
    // fill 4 char with zeros
    weightstring = `0${weightstring}`;
  }
  return `${dispatch + randomNumber(3) + finalbag}0${weightstring}`;
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
      // actualStatus = ['EMA']; // Posting / Collection
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
      if (typeofpatch !== 'receivedExcess') {
        // begin directdespatch status - Operator of transits
        actualStatus = ['EMC', 'PREDES']; // Left Origin (Originally called Item Left)
      }
      datestatus.setDate(datestatus.getDate() + config.simulate.days[3]);
      break;
    case 7:
      // actualStatus = ['EMJ']; // Left Origin (Originally called Item Left)
      break;
    case 8:
      // actualStatus = ['EMK']; // Left Origin (Originally called Item Left)
      break;
    // end directdespatch status
    case 9:
      actualStatus = ['EMD', 'EDA']; // Arrive Destination Post (Receipt Scan)
      datestatus.setDate(datestatus.getDate() + config.simulate.days[4]);
      break;
    case 10:
      actualStatus = ['EDB']; // Into Customs
      datestatus.setDate(datestatus.getDate() + config.simulate.days[5]);
      break;
    case 11:
      if (typeofpatch === 'seizedorReturned' && randomreceivedExcess === 2) {
        actualStatus = ['EME']; // RETENIDO: Handed over to customs
        datestatus.setDate(datestatus.getDate() + 1);
      }
      break;
    case 12:
      actualStatus = ['EDC', 'EMF', 'EDD', 'EDE']; // Out of Customs
      datestatus.setDate(datestatus.getDate() + config.simulate.days[6]);
      break;
    case 13:
      if (typeofpatch === 'seizedorReturned' && randomreceivedExcess === 3) {
        actualStatus = ['EDX']; // cancelation or terminated , status 4 to 6
        datestatus.setDate(datestatus.getDate() + 1);
      }
      break;
    case 14:
      actualStatus = ['EMG', 'EDF', 'EDG', 'EDH', 'EMH', 'EMI']; // Delivery
      datestatus.setDate(datestatus.getDate() + config.simulate.days[7]);
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

class DispatchSimulator {
  simulate = (
    size: string,
    origin: string,
    destination: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> => {
    let repeatpackage = 1;
    if (size === 'small') {
      repeatpackage = config.simulate.size.small;
    } else if (size === 'medium') {
      repeatpackage = config.simulate.size.medium;
    } else if (size === 'large') {
      repeatpackage = config.simulate.size.large;
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
      repeatpackage * config.simulate.ReceivedinExcess_rate / 100,
    );
    logger.info(
      ` Packets with rate NumOfRecInExcess      ${rateNumOfRecInExcess}`,
    );
    const rateNumOfLostParcel = Math.round(
      repeatpackage * config.simulate.LostParcel_rate / 100,
    );
    logger.info(
      ` Packets with rate NumOfLostParcel       ${rateNumOfLostParcel}`,
    );
    const rateNumOfSeizedorReturned = Math.round(
      repeatpackage * config.simulate.SeizedorReturned_rate / 100,
    );
    logger.info(
      ` Packets with rate NumOfSeizedorReturned ${rateNumOfSeizedorReturned}`,
    );
    const totalrateNumPackages =
      rateNumOfRecInExcess + rateNumOfLostParcel + rateNumOfSeizedorReturned;
    const totalNumPackages = repeatpackage - totalrateNumPackages;
    // logger.info("TOTAL RATES " + totalrateNumPackages);
    // logger.info("TOTAL MINUS RATES " + totalNumPackages);

    // REPEAT X PACKAGE FROM SIZE
    for (let j = 0; j < repeatpackage; j += 1) {
      if (j % 50 === 0) {
        EDIpackagetype = randomArray(PackageType);
        // GENERATE DISPATCHID EACH 50 PACKAGEID GENERATED (with same origin, destination and package type)
        EDIdispatchid = generatedispatch(
          EDIorigin,
          EDIdestination,
          EDIpackagetype,
        );
      }
      const EDIpackageParams = getPackageParams(EDIpackagetype[0]);
      const EDIpackageid = generatepackage(EDIorigin, EDIpackagetype);
      const EDIreceptacleId = generatereceipt(
        EDIdispatchid,
        EDIpackageParams[1],
      );

      let i = 0;
      let countstatus = 0;

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
      let typeofpatch;
      const randomreceivedExcess = Math.floor(Math.random() * 4);
      const randomlostpackage = randomArray(lostpackagestatus); // random lost status
      // let rememberhourlostpackage; //remember last date for repeat lost status

      do {
        // dispatch empty or not
        if (i < 1) {
          dispatchId = '';
          originReceptacleId = '';
        } else {
          dispatchId = EDIdispatchid;
          originReceptacleId = EDIreceptacleId;
        }
        // receptacleId empty or not
        if (i < 4) {
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

        // type o patch: happypatch, lost, seized or returned and received in excess
        if (totalNumPackages > j) {
          // HAPPY PATH
          typeofpatch = 'happypatch';
          // logger.info(j); //mensaje normal
        } else if (
          totalNumPackages <= j &&
          j < totalNumPackages + rateNumOfSeizedorReturned
        ) {
          // Seized or Returned by Customs
          typeofpatch = 'seizedorReturned';
        } else if (
          totalNumPackages + rateNumOfSeizedorReturned <= j &&
          j < totalNumPackages + rateNumOfSeizedorReturned + rateNumOfLostParcel
        ) {
          // Lost Parcel
          typeofpatch = 'lostParcel';
        } else if (
          totalNumPackages + rateNumOfSeizedorReturned + rateNumOfLostParcel <=
          j
        ) {
          // Received In Excess
          typeofpatch = 'receivedExcess';
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
          if (i < 1) {
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
      logger.info(
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
  createpackage = (EDImessage: []): Promise<any> => {
    for (let i = 0; i < EDImessage.length; i += 1) {
      postal.createPackage(EDImessage[i]);
    }
    return EDImessage;
  };

  // insert intro blockchain-updatepackage all the status package
  updatepackage = (EDImessage: []): Promise<any> => {
    // *** for demo app we have to do a little bit of processing here ****
    const payload = {};
    const packageIds = [];
    const newShipmentStatus = [];
    const lastUpdated = [];
    const newSettlementStatus = [];
    EDImessage.forEach(ediMessage => {
      packageIds.push(ediMessage.packageId);
      newShipmentStatus.push(ediMessage.shipmentStatus);
      lastUpdated.push(ediMessage.lastUpdated);
      newSettlementStatus.push(ediMessage.settlementStatus);
    });
    payload.packageIDs = packageIds;
    payload.newShipmentStatus = newShipmentStatus;
    payload.lastUpdated = lastUpdated;
    payload.newSettlementStatus = newSettlementStatus;
    postal.updateShipmentStatus(payload);
    return EDImessage;
  };
}

export default DispatchSimulator;

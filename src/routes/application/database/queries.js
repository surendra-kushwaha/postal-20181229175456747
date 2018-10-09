import logger from '../../../logger';

const {
  createArrayOfDispatches,
  createDispatchIdArray,
  performDispatchCalculations,
} = require('./utilities');

const {
  findOnePackage,
  findPackages,
  removePackages,
} = require('../../../lib/postalPackageDataController');
/* const queryObj = {
  originPost: req.body.originPost,
  destinationPost: req.body.destinationPost,
  startDate: req.body.startDate,
  endDate: req.body.endDate,
  dateCreated: req.body.dateCreated,
}; */

const noneArray = [undefined, '""', 'none', 'NONE', '"none"', '"NONE"', ''];

// Get dispatch level report
const report = async (req, res) => {
  const queryObj = {
    originPost: req.body.originPost,
    destinationPost: req.body.destinationPost,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    dateCreated: req.body.dateCreated,
  };
  // logger.info(`Input Params:${JSON.stringify(queryObj)}`);

  try {
    const postalData = await findPackages(queryObj);
    const dispatchIds = createDispatchIdArray(postalData);
    const dispatches = createArrayOfDispatches(dispatchIds, postalData);
    // logger.debug(`Dispatches: ${JSON.stringify(dispatches)}`);
    const reportData = performDispatchCalculations(dispatches, queryObj); // final array to push completed dispatch data
    res.send({ status: 'success', data: reportData });
  } catch (err) {
    res.send({ status: 'fail', data: { msg: err } });
  }
};

// Get package details for dispatch
const getPackageReport = async (req, res) => {
  // logger.info(`Req.query: ${JSON.stringify(req.query)}`);
  const queryObj = {
    dispatchId: req.query.dispatchId,
  };
  if (noneArray.includes(queryObj.dispatchId)) {
    queryObj.dispatchId = '';
  }
  // logger.info(JSON.stringify(queryObj));
  try {
    const postalData = await findPackages(queryObj);
    res.send({ status: 'success', data: postalData });
  } catch (err) {
    res.send({ status: 'fail', data: { msg: err } });
  }
};

// Get package details for packages with no dispatchId
const postPackageReport = async (req, res) => {
  const queryObj = {
    originPost: req.body.originPost,
    destinationPost: req.body.destinationPost,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    dateCreated: req.body.dateCreated,
    packageType: req.body.packageType,
    dispatchId: req.body.dispatchId,
  };
  // logger.info(`Input Params:${JSON.stringify(queryObj)}`);

  if (noneArray.includes(queryObj.dispatchId)) {
    queryObj.dispatchId = '';
  }

  try {
    const postalData = await findPackages(queryObj);
    res.send({ status: 'success', data: postalData });
  } catch (err) {
    res.send({ status: 'fail', data: { msg: err } });
  }
};

// Mongo DB changes end here

const filterViewReports = (packages: []) => {
  const filteredArray = [];
  packages.forEach(packageObj => {
    // need to get rid of unique identifier of each package
    const viewReportObj = {
      originPost: packageObj.originPost,
      destinationPost: packageObj.destinationPost,
      startDate: packageObj.startDate,
      endDate: packageObj.endDate,
      dateCreated: packageObj.dateCreated,
    };
    if (filteredArray.length < 1) {
      filteredArray.push(viewReportObj);
    } else {
      let same = false;
      filteredArray.forEach(uniqueObject => {
        if (
          viewReportObj.originPost === uniqueObject.originPost &&
          viewReportObj.destinationPost === uniqueObject.destinationPost &&
          String(viewReportObj.startDate) === String(uniqueObject.startDate) &&
          String(viewReportObj.endDate) === String(uniqueObject.endDate) &&
          String(viewReportObj.dateCreated) === String(uniqueObject.dateCreated)
        ) {
          same = true;
        }
      });
      if (!same) {
        logger.debug('Adding view report object');
        filteredArray.push(viewReportObj);
      }
    }
  });
  return filteredArray;
};

const viewReports = async (req, res) => {
  const { country } = req.query;
  const queryObj = {
    $or: [{ originPost: country }, { destinationPost: country }],
  };

  try {
    const postalData = await findPackages(
      queryObj,
      'startDate endDate originPost destinationPost dateCreated',
    );
    // need to filter any duplicate results
    const filteredData = filterViewReports(postalData);
    // logger.info(`Filtered data: ${JSON.stringify(filteredData, null, 2)}`);
    res.send({ status: 'success', data: filteredData });
  } catch (err) {
    res.send({ status: 'fail', data: { msg: err } });
  }
  // res.status(200).json('');
};

const getPackage = async (req, res) => {
  try {
    const postalData = await findOnePackage(req.query.packageId);
    res.send({ status: 'success', data: postalData });
  } catch (err) {
    res.send({ status: 'fail', data: { msg: err } });
  }
};

const clearData = async (req, res) => {
  try {
    const postalData = await removePackages({});
    res.send({ status: 'success', data: postalData });
  } catch (err) {
    res.send({ status: 'fail', data: { msg: err } });
  }
};

export {
  viewReports,
  report,
  postPackageReport,
  getPackageReport,
  getPackage,
  clearData,
};

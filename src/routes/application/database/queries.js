import logger from '../../../logger';

const { PostalPackage } = require('../../../models/postalPackageData');

/* const queryObj = {
  originPost: req.body.originPost,
  destinationPost: req.body.destinationPost,
  startDate: req.body.startDate,
  endDate: req.body.endDate,
  dateCreated: req.body.dateCreated,
}; */
const initializeDispatchObject = (dispatchId, packageType, queryObj) => ({
  dispatchId,
  packageType,
  originPost: queryObj.originPost,
  destinationPost: queryObj.destinationPost,
  startDate: queryObj.startDate,
  endDate: queryObj.endDate,
  dateCreated: queryObj.dateCreated,
});

// helper function to get an array of dispatchIds from all returned package data objects
const createDispatchIdArray = postalPackageData => {
  const dispatchIdArray = [];
  postalPackageData.forEach(packageObject => {
    if (!dispatchIdArray.includes(packageObject.dispatchId)) {
      dispatchIdArray.push(packageObject.dispatchId);
    }
  });
  return dispatchIdArray;
};

// helper function that creates array of dispatch arrays. Each dispatch array contains all packages with that dispatchId
const createArrayOfDispatches = (dispatchIds, postalPackageData) => {
  const dispatches = [];
  dispatchIds.forEach(dispatchId => {
    const dispatchPackageArray = postalPackageData.filter(
      packageObject => packageObject.dispatchId === dispatchId,
    );
    const dispatch = {
      dispatchId,
      dispatchPackageArray,
    };
    dispatches.push(dispatch);
  });
  return dispatches;
};

// Perform all necessary calculations for front end application
const performDispatchCalculations = (dispatches, queryObj) => {
  const reconciledStatus = ['Reconciled', 'Settlement Agreed'];
  const resultArray = [];
  dispatches.forEach(dispatch => {
    // initialize variables that we will return
    const dispatchObject = initializeDispatchObject(
      dispatch.dispatchId,
      dispatch.dispatchPackageArray[0].packageType,
      queryObj,
    );
    let reconciledPackages = 0;
    let reconciledWeight = 0;
    let unreconciledPackages = 0;
    let unreconciledWeight = 0;
    dispatch.dispatchPackageArray.forEach(packageObject => {
      logger.debug(
        `Package settlement status is ${packageObject.settlementStatus}`,
      );
      if (reconciledStatus.includes(packageObject.settlementStatus)) {
        reconciledPackages += 1;
        reconciledWeight += packageObject.weight;
      } else {
        unreconciledPackages += 1;
        unreconciledWeight += packageObject.weight;
      }
    });
    dispatchObject.totalReconciledPackages = reconciledPackages;
    dispatchObject.totalReconciledWeight = reconciledWeight;
    dispatchObject.totalUnreconciledPackages = unreconciledPackages;
    dispatchObject.totalUnreconciledWeight = unreconciledWeight;
    if (unreconciledPackages > 0) {
      dispatchObject.settlementStatus = 'Unreconciled';
    } else {
      dispatchObject.settlementStatus = 'Reconciled';
    }
    resultArray.push(dispatchObject);
  });
  return resultArray;
};

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

  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      const dispatchIds = createDispatchIdArray(postalData);
      const dispatches = createArrayOfDispatches(dispatchIds, postalData);
      // logger.debug(`Dispatches: ${JSON.stringify(dispatches)}`);
      const reportData = performDispatchCalculations(dispatches, queryObj); // final array to push completed dispatch data
      res.send({ status: 'success', data: reportData });
    }
  });
};

// Get package details for dispatch
const getPackageReport = (req, res) => {
  // logger.info(`Req.query: ${JSON.stringify(req.query)}`);
  const queryObj = {
    dispatchId: req.query.dispatchId,
  };
  if (
    queryObj.dispatchId === undefined ||
    queryObj.dispatchId === '""' ||
    queryObj.dispatchId === '' ||
    queryObj.dispatchId === '"none"'
  ) {
    queryObj.dispatchId = 'none';
  }
  // logger.info(JSON.stringify(queryObj));
  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      res.send({ status: 'success', data: postalData });
    }
  });
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

  if (
    queryObj.dispatchId === undefined ||
    queryObj.dispatchId === '""' ||
    queryObj.dispatchId === '' ||
    queryObj.dispatchId === '"none"' ||
    queryObj.dispatchId === '"NONE"'
  ) {
    queryObj.dispatchId = 'none';
  }

  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      res.send({ status: 'success', data: postalData });
    }
  });
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

const viewReports = (req, res) => {
  const { country } = req.query;
  const queryObj = {
    $or: [{ originPost: country }, { destinationPost: country }],
  };
  PostalPackage.find(
    queryObj,
    'startDate endDate originPost destinationPost dateCreated',
    (err, postalData) => {
      if (err) {
        res.send({ status: 'fail', data: { msg: err } });
      } else {
        // need to filter any duplicate results
        const filteredData = filterViewReports(postalData);
        // logger.info(`Filtered data: ${JSON.stringify(filteredData, null, 2)}`);
        res.send({ status: 'success', data: filteredData });
      }
    },
  );
  // res.status(200).json('');
};

const getPackage = (req, res) => {
  const queryObj = {
    packageId: req.query.packageId,
  };
  PostalPackage.find(queryObj, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      res.send({ status: 'success', data: postalData });
    }
  });
};

const clearData = (req, res) => {
  PostalPackage.remove({}, (err, postalData) => {
    if (err) {
      res.send({ status: 'fail', data: { msg: err } });
    } else {
      res.send({ status: 'success', data: postalData });
    }
  });
};

export {
  viewReports,
  report,
  postPackageReport,
  getPackageReport,
  getPackage,
  clearData,
};

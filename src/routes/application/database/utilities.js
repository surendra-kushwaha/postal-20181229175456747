import logger from '../../../logger';

const noneArray = [undefined, '""', 'none', 'NONE', '"none"', '"NONE"', ''];

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
    if (noneArray.includes(dispatchId)) {
      const packageTypes = [];
      dispatchPackageArray.forEach(noDispatchIdPackage => {
        if (!packageTypes.includes(noDispatchIdPackage.packageType)) {
          packageTypes.push(noDispatchIdPackage.packageType);
        }
      });
      packageTypes.forEach(packageType => {
        const packageTypePackageArray = dispatchPackageArray.filter(
          dispatchPackage => dispatchPackage.packageType === packageType,
        );
        const dispatch = {
          dispatchId,
          dispatchPackageArray: packageTypePackageArray,
        };
        dispatches.push(dispatch);
      });
    } else {
      const dispatch = {
        dispatchId,
        dispatchPackageArray,
      };
      dispatches.push(dispatch);
    }
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

export {
  initializeDispatchObject,
  createArrayOfDispatches,
  createDispatchIdArray,
  performDispatchCalculations,
  filterViewReports,
};

/* eslint-disable */
import logger from '../../src/logger';
module.exports = () => {
  const postalscm_lib = {};
  postalscm_lib.call_chaincode = jest.fn((options, callback) => {
    try{
      logger.debug(`ARGS:${options.args}`)
      if(options.args.includes("undefined"))
      throw Error;
    const err = undefined; // no error occurs
    const functionName = options.func;
    const response = {};
    const todateTimeStamp = new Date();
    const today =
      todateTimeStamp.getMonth() + 1 < 10
        ? `0${todateTimeStamp.getMonth() +
            1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`
        : `${todateTimeStamp.getMonth() +
            1}/${todateTimeStamp.getDate()}/${todateTimeStamp.getFullYear()}`;
    const packageHistory = 
    [
      { value:
        { ShipmentStatus:'EMA',
          TransactionName:'createPostalPackage',
          LastUpdated:today,
          SettlementStatus:'Unreconciled',
        }
      },
      { value:
        { SettlementStatus:'Reconciled',
          TransactionName:'updateSettlementStatus',
          LastUpdated:today
        }
      },
      { value:
        { SettlementStatus:'Settlement Disputed',
          TransactionName:'updateSettlementStatus',
          LastUpdated:today
        }
      },
      { value:
        { ShipmentStatus:'EMD',
          TransactionName:'shipmentStatus',
          LastUpdated:today
        }
      }
    ]
    if (functionName === 'createPostalPackage') {
      response.data = options.args;
    } else if (functionName === 'getPackageHistory') {
      if(options.args[0] == 'packageHistoryTest')
      response.parsed = packageHistory;
      else
      response.parsed = options.args;
    } else if (functionName === 'updateShipmentStatus') {
      response.data = options.args[0];
    } else if (functionName === 'updateSettlementStatus') {
      response.data = options.args[0];
    }
    callback(err, response);
  }catch(err){
    callback(Error,undefined);
  }
  });
  return postalscm_lib;
  
}
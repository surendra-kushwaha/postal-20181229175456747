/* @flow */

import { $Request, $Response } from 'express';
import logger from '../../../logger';
import DispatchSimulator from '../../../lib/simulate';
import config from '../../../config';

const dispatchsimulator = new DispatchSimulator();

/**
 * This function handles the logic for the chatbot endpoint.
 * It returns the Watson Conversation response to the client.
 * @param  {$Request} req
 * @param  {$Response} res
 */

const simulate = async (req: $Request, res: $Response) => {
  let response: Object = {};
  try {
    const {
      body: { size, originPost, destinationPost, startDate, endDate },
    } = req;

    // chech days between start and end dates:
    const daysofstatus = config.simulate.days;
    let totaldaysofstatus = 0;
    for (let z = 0; z < daysofstatus.length; z += 1) {
      totaldaysofstatus += +daysofstatus[z];
    }

    const datestart = new Date(startDate);
    const dateend = new Date(endDate);
    const dayasmilliseconds = 86400000;
    const diffinmillisenconds = dateend - datestart;
    const diffindays =
      diffinmillisenconds / dayasmilliseconds - totaldaysofstatus - 1;
    if (diffindays <= 0) {
      logger.error(
        'Error between start and end dates. Was not able to get simulated data.',
      );
      res
        .status(500)
        .send(
          'Error between start and end dates. Was not able to get simulated data.',
        );
    }
    // end check

    logger.debug(`Sending Size: ${size}`);
    response = await dispatchsimulator.simulate(
      size,
      originPost,
      destinationPost,
      startDate,
      endDate,
    );

    try {
      const promiseResults = await dispatchsimulator.createpackage(
        response[0],
        startDate,
        endDate,
      ); // CreatePackage In BlockChain - also need to include startDate and endDate
      promiseResults.forEach(result => {
        if (result instanceof Error) {
          logger.error('reject reason', result.rejectErr);
        } else {
          // fulfilled value
          logger.info('Package created in blockchain and saved in database');
        }
      });
    } catch (createError) {
      logger.error(`There was an error creating packages: ${createError}`);
    }
    try {
      const promiseResults = await dispatchsimulator.updatepackage(response[1]); // Update Package In BlockChain
      promiseResults.forEach(result => {
        if (result instanceof Error) {
          logger.error('reject reason', result.rejectErr);
        } else {
          // fulfilled value
          logger.info('Package updated in blockchain and saved in database');
        }
      });
    } catch (updateError) {
      logger.error(
        `There was an error updating packages during simulation. ${updateError}`,
      );
    }
    res.status(200).end('Simulation complete.');
  } catch (error) {
    logger.error(
      `There was an error retrieving a response from SIMULATE DISPATH`,
      error,
    );
    res.status(500).send('Was not able to get simulated data.');
  }
};

export default simulate;

/* @flow */

import { $Request, $Response } from 'express';
import logger from '../../../logger';
import DispatchSimulator from '../../../lib/simulate';

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
    res.send('Simulation complete.');
    res.status(200).end();
  } catch (error) {
    logger.error(
      `There was an error retrieving a response from SIMULATE DISPATH`,
      error,
    );
    res.status(500).send('Was not able to get simulated data.');
  }
  res.send('Simulation complete.');
};

export default simulate;

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

    // res.send(response);
    res.send('Simulation complete.');
    await dispatchsimulator.createpackage(response[0], startDate, endDate); // CreatePackage In BlockChain - also need to include startDate and endDate
    await dispatchsimulator.updatepackage(response[1]); // Update Package In BlockChain

    res.status(200).end();
  } catch (error) {
    logger.error(
      `There was an error retrieving a response from SIMULATE DISPATH`,
      error,
    );
    res.send('Was not able to get simulated data.');
    res.status(500).end();
  }
};

export default simulate;

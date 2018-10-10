/* @flow */

import { $Request, $Response } from 'express';
import logger from '../../../logger';

/**
 * This function handles the logic for the inputting data from the EDI message bus.
 * @param  {$Request} req
 * @param  {$Response} res
 */
const inputData = async (req: $Request, res: $Response) => {
  logger.info(req.body);
  res.send(200);
};

export default inputData;

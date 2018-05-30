'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _express = require('express');
var _logger = require('../../../logger');var _logger2 = _interopRequireDefault(_logger);
var _simulate = require('../../../lib/simulate');var _simulate2 = _interopRequireDefault(_simulate);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const dispatchsimulator = new _simulate2.default();

/**
                                                     * This function handles the logic for the chatbot endpoint.
                                                     * It returns the Watson Conversation response to the client.
                                                     * @param  {$Request} req
                                                     * @param  {$Response} res
                                                     */

const simulate = async (req, res) => {
  let response = {};
  try {
    const {
      body: { size, originPost, destinationPost, startDate, endDate } } =
    req;
    _logger2.default.debug(`Sending Size: ${size}`);
    response = await dispatchsimulator.simulate(
    size,
    originPost,
    destinationPost,
    startDate,
    endDate);


    // res.send(response);
    res.send('Simulation complete.');
    await dispatchsimulator.createpackage(response[0]); // CreatePackage In BlockChain
    await dispatchsimulator.updatepackage(response[1]); // Update Package In BlockChain

    res.status(200).end();
  } catch (error) {
    _logger2.default.error(
    `There was an error retrieving a response from SIMULATE DISPATH`,
    error);

    res.send('Was not able to get simulated data.');
    res.status(500).end();
  }
};exports.default =

simulate;
//# sourceMappingURL=queries.js.map

//-------------------------------------------------------------------
// Invoke Chaincode
//-------------------------------------------------------------------
const path = require('path');

module.exports = function(g_options, logger) {
  const common = require(path.join(__dirname, './common.js'))(logger);
  const invoke_cc = {};

  if (!g_options) g_options = {};
  if (!g_options.block_delay) g_options.block_delay = 10000;

  //-------------------------------------------------------------------
  // Invoke Chaincode - aka write to the ledger
  //-------------------------------------------------------------------
  /*
		options: {
					chaincode_id: "chaincode id",
					event_url: "peers event url",			<optional>
					endorsed_hook: function(error, res){},	<optional>
					ordered_hook: function(error, res){},	<optional>
					cc_function: "function_name",
					cc_args: ["argument 1"],
					peer_tls_opts: {
						pem: 'complete tls certificate',					<required if using ssl>
						common_name: 'common name used in pem certificate' 	<required if using ssl>
					}
		}
	*/
  invoke_cc.invoke_chaincode = function(obj, options, cb) {
    logger.debug(`[fcw] Invoking Chaincode: ${options.cc_function}()`);
    let eventHub;
    const channel = obj.channel;
    const client = obj.client;
    let cbCalled = false;
    const startTime = Date.now();

    // send proposal to endorser
    const request = {
      chaincodeId: options.chaincode_id,
      fcn: options.cc_function,
      args: options.cc_args,
      txId: client.newTransactionID(),
    };
    // logger.debug('[fcw] Sending invoke req', request);

    // Setup EventHub
    if (options.event_url) {
      logger.debug('[fcw] listening to event url', options.event_url);
      eventHub = client.newEventHub();
      eventHub.setPeerAddr(options.event_url, {
        pem: options.peer_tls_opts.pem,
        'ssl-target-name-override': options.peer_tls_opts.common_name, // can be null if cert matches hostname
        'grpc.http2.keepalive_time': 15,
      });
      eventHub.connect();
    } else {
      logger.debug('[fcw] will not use tx event');
    }
    // Send Proposal
    channel
      .sendTransactionProposal(request)
      .then(results => {
        // Check Response
        const request = common.check_proposal_res(
          results,
          options.endorsed_hook,
        );
        return channel.sendTransaction(request);
      })
      .then(response => {
        // All good
        if (response.status === 'SUCCESS') {
          // logger.debug('[fcw] Successfully ordered endorsement transaction.');

          // Call optional order hook
          if (options.ordered_hook)
            options.ordered_hook(null, request.txId.toString());

          // ------- [A] Use Event for Tx Confirmation ------- // option A
          if (options.event_url) {
            try {
              // Watchdog for no block event
              const watchdog = setTimeout(() => {
                logger.error(
                  '[fcw] Failed to receive block event within the timeout period',
                );
                eventHub.disconnect();

                if (cb && !cbCalled) {
                  cbCalled = true;
                  return cb(null); // timeout pass it back
                }
              }, g_options.block_delay + 300000); // increasing timeout from 2000 to 90000

              // Wait for tx committed event
              eventHub.registerTxEvent(
                request.txId.getTransactionID(),
                (tx, code) => {
                  const elapsed = `${Date.now() - startTime}ms`;
                  logger.info(
                    '[fcw] The chaincode transaction event has happened! success?:',
                    code,
                    elapsed,
                  );
                  clearTimeout(watchdog);
                  eventHub.disconnect();

                  if (code !== 'VALID') {
                    if (cb && !cbCalled) {
                      cbCalled = true;
                      return cb(
                        common.format_error_msg(`Commit code: ${code}`),
                      ); // pass error back
                    }
                    return;
                  }
                  if (cb && !cbCalled) {
                    cbCalled = true;
                    return cb(null); // all good, pass it back
                  }
                },
              );
            } catch (e) {
              logger.error('[fcw] Illusive event error: ', e); // not sure why this happens, seems rare 3/27/2017
              try {
                eventHub.disconnect();
              } catch (e) {}
              if (cb && !cbCalled) {
                cbCalled = true;
                return cb(e); // all terrible, pass it back
              }
            }

            // ------- [B] Wait xxxx ms for Block  ------- // option B
          } else {
            setTimeout(() => {
              if (cb) return cb(null);
            }, g_options.block_delay + 300000); // increasing timeout from 2000 to 90000
          }
        }

        // ordering failed, No good
        else {
          if (options.ordered_hook) options.ordered_hook('failed');
          logger.error(
            '[fcw] Failed to order the transaction. Error code: ',
            response,
          );
          throw response;
        }
      })
      .catch(err => {
        logger.error('[fcw] Error in invoke catch block', typeof err, err);
        if (options.event_url) {
          eventHub.disconnect();
        }

        const formatted = common.format_error_msg(err);
        if (options.ordered_hook) options.ordered_hook('failed', formatted);

        if (cb) return cb(formatted, null);
      });
  };
  return invoke_cc;
};

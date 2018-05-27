//-------------------------------------------------------------------
// SharedAccums Chaincode Library
//-------------------------------------------------------------------

module.exports = function (enrollObj, g_options, fcw, logger) {
	var sharedaccums_chaincode = {};
	//var sharedaccums_chaincode = {};

	// Chaincode -------------------------------------------------------------------------------
	sharedaccums_chaincode.call_chaincode = function (options, cb) {
		console.log('');
		logger.info('Adding User...');

		var opts = {
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_url: g_options.event_url,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			/*cc_function: 'AddUser',
			cc_args: [
				"{\"UserID\": \"0\", \"Date\":\"20170722110112\", \"Price\":\"6\"}"
			],*/
			cc_function:options.func,
			cc_args:options.args,
			peer_tls_opts: g_options.peer_tls_opts,
		};
		if(options.method_type=='invoke'){
				fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
					if (cb) {
						if(!resp) resp = {};
						resp.id = opts.cc_args[0];			//pass marble id back
						cb(err, resp);
					}
				});
	   }else{
			 fcw.query_chaincode(enrollObj, opts, cb);
		 }
	};

	sharedaccums_chaincode.channel_stats = function (options, cb) {
		logger.info('Fetching block height...');
		fcw.query_channel(enrollObj, null, cb);
	};
	// random string of x length
	function randStr(length) {
		var text = '';
		var possible = 'abcdefghijkmnpqrstuvwxyz0123456789ABCDEFGHJKMNPQRSTUVWXYZ';
		for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}

	// left pad string with "0"s
	function leftPad(str, length) {
		for (var i = str.length; i < length; i++) str = '0' + String(str);
		return str;
	}
	

	return sharedaccums_chaincode;
};


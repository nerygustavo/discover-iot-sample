/* globals require, module, process, console */

'use strict';

(function() {
	var q = require('q');

	var api = require('../../base/provider');

	var getMessageSources = function() {
		return api.getPromise('/message/source');
	};
	var createMessageSource = function(json) {
		return api.postPromise('/message/source', json);
	};

	var verifyMsgSource = function(messageSources, orgId) {
		return api.verify(messageSources, 'orgId', orgId);
	};

	var verifyPlayMsgSource = function(messageSources) {
		return verifyMsgSource(messageSources, 'play');
	};

	var createPlayOrg = function() {
		var defer = q.defer();

		getMessageSources()
			.then(verifyPlayMsgSource)
			.then(function(object) {

				if (!object.result) {

					var msgSource = require('../../../schemas/message/source');

					var VCAP = JSON.parse(process.env.VCAP_SERVICES);

					var iotService = VCAP['iotf-service'];
					var credentials = {};
					for (var index in iotService) {
						if (iotService[index].name === 'discover-iot-try-service') {
							credentials = iotService[index].credentials;
						}
					}

					msgSource.name = 'discover-iot-try-service';
					msgSource.orgId = credentials.org;
					msgSource.apiKey = credentials.apiKey;
					msgSource.authToken = credentials.apiToken;

					createMessageSource(msgSource)
						.then(function(json) {
							defer.resolve(json);
						});
				}
				else {
					defer.resolve(object.element);
				}

			});

		return defer.promise;
	};

	var object = {
		getMessageSources: getMessageSources,
		createMessageSource: createMessageSource,

		createPlayOrg: createPlayOrg
	};

	module.exports = object;

})();
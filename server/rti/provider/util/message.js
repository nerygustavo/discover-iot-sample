/* globals module, require */

'use strict';

(function() {

	var q = require('q');

	var sourceUtil = require('./message/messagesource');
	var schemaUtil = require('./message/messageschema');
	var routeUtil = require('./message/messageroute');

	var createAll = function() {
		var defer = q.defer();

		sourceUtil.createPlayOrg()
			.then(schemaUtil.createAllSchemas)
			.spread(routeUtil.createAllRoutes)
			.spread(function(playOrg, schemas, routes) {
				defer.resolve({
					messageSources: playOrg,
					messageSchemas: schemas,
					routes: routes
				});
			});

		return defer.promise;
	};

	module.exports = {
		createAll: createAll,

		source: sourceUtil,
		schema: schemaUtil,
		route: routeUtil
	};

})();
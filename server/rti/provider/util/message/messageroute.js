/* globals require, module*/

'use strict';

(function() {
	var q = require('q');

	var api = require('../../base/provider');
	var schemaUtil = require('./messageschema');

	var getMessageRoutes = function() {
		return api.getPromise('/message/route');
	};
	var getMessageRoute = function(sourceId, schemaId) {
		return api.getPromise('/message/route?' + sourceId + ',' + schemaId);
	};
	var createMessageRoute = function(json) {
		return api.postPromise('/message/route', json);
	};

	var createMessageRoutePromise = function(sourceId, schemaId, deviceType) {
		var create = function() {
			var defer = q.defer();

			getMessageRoute(sourceId, schemaId).then(function(messageRoutes) {
				var verifyObject = verifyRoute(messageRoutes, sourceId, schemaId);

				if (!verifyObject.result) {
					var routeTemplate = require('../../../schemas/message/route');
					routeTemplate.sourceId = sourceId;
					routeTemplate.schemaId = schemaId;
					routeTemplate.deviceType = deviceType;

					createMessageRoute(routeTemplate)
						.then(function(json) {
							defer.resolve(json);
						});
				}
				else {
					defer.resolve(verifyObject.element);
				}
			});

			return defer.promise;
		};

		return q.fcall(create);
	};

	var createAllRoutes = function(playOrg, schemasArray) {
		var promises = [];

		var messageSourceId = playOrg.id;

		for (var i in schemasArray) {
			if (schemasArray[i]) {
				var messageSchemaId = schemasArray[i].id;
				var messageSchemaName = schemasArray[i].name;
				if (messageSchemaId && messageSourceId) {
					promises.push(createMessageRoutePromise(messageSourceId, messageSchemaId, schemaUtil.getDeviceType(messageSchemaName)));
				}
			}
		}

		return [playOrg, schemasArray, q.all(promises)];
	};

	var verifyRoute = function(messageRoutes, sourceId, schemaId) {
		return api.verify(messageRoutes, 'sourceId', sourceId, 'schemaId', schemaId);
	};

	var object = {
		getMessageRoutes: getMessageRoutes,
		getMessageRoute: getMessageRoute,
		createMessageRoute: createMessageRoute,

		createAllRoutes: createAllRoutes
	};

	module.exports = object;

})();
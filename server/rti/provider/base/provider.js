/* globals require, module, console, process */

'use strict';

(function() {

	var request = require('request');
	var q = require('q');

	var VCAP = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = VCAP['IoT Real-Time Insight'][0].credentials;
	var user = credentials.apiKey;
	var password = credentials.authToken;

	var getPromise = function(path) {
		console.log('calling api to GET: ' + path);

		var url = credentials.baseUrl + path;
		var defer = q.defer();
		var body = '';
		request
			.get(url)
			.auth(user, password, true)
			.on('data', function(data) {
				body += data;
			})
			.on('end', function() {
				var json = JSON.parse(body);
				defer.resolve(json);
			});

		return defer.promise;
	};

	var postPromise = function(path, json) {
		console.log('calling api to POST: ' + path);

		var url = credentials.baseUrl + path;
		var defer = q.defer();
		var body = '';

		request
			.post({
				url: url,
				json: true,
				body: json
			}).auth(user, password, true)
			.on('data', function(data) {
				body += data;
			})
			.on('end', function() {
				var json = JSON.parse(body);
				defer.resolve(json);
			});

		return defer.promise;
	};

	var deletePromise = function(path) {
		console.log('calling api to DELETE: ' + path);

		var url = credentials.baseUrl + path;
		var defer = q.defer();

		request
			.del(url)
			.auth(user, password, true)
			.on('end', function() {
				defer.resolve();
			});

		return defer.promise;
	};

	var verify = function(jsonArray, property, value, property2, value2) {
		if (jsonArray) {
			var filteredArray = jsonArray.filter(function(el) {
				return (el[property] === value);
			});
			if (property2 && value2) {
				filteredArray = filteredArray.filter(function(el) {
					return (el[property2] === value2);
				});
			}
			if (filteredArray.length > 0) {
				return {
					result: true,
					element: filteredArray[0]
				};
			}
		}
		return {
			result: false,
			element: null
		};
	};

	var api = {
		getPromise: getPromise,
		postPromise: postPromise,
		deletePromise: deletePromise,
		verify: verify
	};

	module.exports = api;

})();
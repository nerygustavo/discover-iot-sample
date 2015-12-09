/* globals module, require */

'use strict';

(function() {
	var requireDir = require('require-dir');
	var config = require('config');

	var api = require('../base/provider');
	var files = requireDir('../../schemas/action');
	var types = ['webhook', 'node-red', 'ifttt', 'mail'];

	var getActions = function(type) {
		var path = '/action';
		if (type && types.indexOf(type) >= 0) {
			path += '?type=' + type;
		}

		return api.getPromise(path);
	};

	var createAction = function(json) {
		return api.postPromise('/action', json);
	};

	var createWebhookAction = function() {
		return getActions('webhook').then(function(result) {
			var webhook = files.webhook;
			var found = false;
			var foundIndex = -1;

			for (var i in result) {
				if (result[i].name === webhook.name) {
					found = true;
					foundIndex = i;
					break;
				}
			}

			if (!found) {
				webhook.fields.url = config.get('url') + '/rti/alert';
				return createAction(webhook);
			}
			else {
				return result[foundIndex];
			}
		});
	};

	module.exports = {
		getActions: getActions,
		createWebhookAction: createWebhookAction
	};

})();
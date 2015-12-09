/* globals require, module */

'use strict';

(function() {

	var msgUtil = require('./util/message');
	var ruleUtil = require('./util/rule');
	var actionUtil = require('./util/action');

	var loadPlayExperience = function() {
		return msgUtil.createAll().then(function(result) {
			return actionUtil.createWebhookAction().then(function(action) {
				result.action = action;
				return ruleUtil.createVibrationRule(action.id).then(function(rule) {
					result.rule = rule;
					return result;
				});
			});
		}).then(function(result) {
			return result;
		});
	};

	var api = {
		loadPlayExperience: loadPlayExperience
	};

	module.exports = api;
})();
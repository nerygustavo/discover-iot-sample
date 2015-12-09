/* globals module, require */

'use strict';

(function() {
	var requireDir = require('require-dir');

	var api = require('../base/provider');
	var schemaUtil = require('./message/messageschema');
	var files = requireDir('../../schemas/rule');

	var getRules = function() {
		return api.getPromise('/rule');
	};

	var createRule = function(json) {
		return api.postPromise('/rule', json);
	};

	var createVibrationRule = function(actionId) {
		return schemaUtil
			.getMessageSchemas()
			.then(function(schemas) {
				var validationObject = schemaUtil.validateSchemaName('smartphone');
				if (validationObject.verifyFunction) {

					var object = validationObject.verifyFunction(schemas);

					if (object.result === true) {

						return getRules().then(function(result) {
							var vibration = files.vibration;
							var found = false;
							var foundIndex = -1;

							for (var i in result) {
								if (result[i].name === vibration.name) {
									found = true;
									foundIndex = i;
									break;
								}
							}

							if (!found) {
								vibration.schemaId = object.element.id;
								if (actionId) {
									vibration.actions.push(actionId);
								}
								return createRule(vibration);
							}
							else {
								return result[foundIndex];
							}
						});
					}
					else {
						return {};
					}
				}
			});
	};

	module.exports = {
		getRules: getRules,
		createVibrationRule: createVibrationRule
	};

})();
/* globals require, module */

'use strict';

(function() {
	var q = require('q');
	var requireDir = require('require-dir');

	var api = require('../../base/provider');
	var files = requireDir('../../../schemas/message');

	var schemaFiles = {
		ARDUINO: 'schema-arduino',
		ARMBED: 'schema-armbed',
		INTELEDISON: 'schema-inteledison',
		INTELGALILEO: 'schema-intelgalileo',
		RASPBERRY: 'schema-raspberry',
		SENSORTAG: 'schema-sensortag',
		SMARTPHONE: 'schema-smartphone',
		VEHICLE: 'schema-vehicle'
	};

	var deviceTypes = {};
	deviceTypes[schemaFiles.ARDUINO] = 'iotarduinouno';
	deviceTypes[schemaFiles.ARMBED] = 'iotarmmbed';
	deviceTypes[schemaFiles.INTELEDISON] = 'iotinteledison';
	deviceTypes[schemaFiles.INTELGALILEO] = 'iotintelgalileo';
	deviceTypes[schemaFiles.RASPBERRY] = 'iotraspberrypi';
	deviceTypes[schemaFiles.SENSORTAG] = 'iotsensortag';
	deviceTypes[schemaFiles.SMARTPHONE] = 'iot-phone';
	deviceTypes[schemaFiles.VEHICLE] = 'vehicle';

	var getMessageSchemas = function() {
		return api.getPromise('/message/schema');
	};
	var createMessageSchema = function(json) {
		return api.postPromise('/message/schema', json);
	};

	var validateSchemaName = function(schemaName) {

		var name = null;
		var verifyFunction = null;

		if (schemaName.toLowerCase().search('smartphone') >= 0) {
			name = schemaFiles.SMARTPHONE;
		}
		else if (schemaName.toLowerCase().search('arduino') >= 0) {
			name = schemaFiles.ARDUINO;
		}
		else if (schemaName.toLowerCase().search('armbed') >= 0) {
			name = schemaFiles.ARMBED;
		}
		else if (schemaName.toLowerCase().search('inteledison') >= 0) {
			name = schemaFiles.INTELEDISON;
		}
		else if (schemaName.toLowerCase().search('intelgalileo') >= 0) {
			name = schemaFiles.INTELGALILEO;
		}
		else if (schemaName.toLowerCase().search('raspberry') >= 0) {
			name = schemaFiles.RASPBERRY;
		}
		else if (schemaName.toLowerCase().search('sensortag') >= 0) {
			name = schemaFiles.SENSORTAG;
		}
		else if (schemaName.toLowerCase().search('vehicle') >= 0) {
			name = schemaFiles.VEHICLE;
		}

		if (name) {
			verifyFunction = function(messageSchemas) {
				return verifySchema(messageSchemas, name);
			};
		}

		return {
			schemaName: name,
			verifyFunction: verifyFunction
		};
	};

	var verifySchema = function(messageSchemas, schemaFileName) {
		return api.verify(messageSchemas, 'name', files[schemaFileName].name);
	};

	var createSchema = function(messageSource, messageSchemas, schemaName) {

		var execute = function() {
			var defer = q.defer();

			if (schemaName) {
				var verifyObject = validateSchemaName(schemaName);

				if (verifyObject.verifyFunction) {

					q.fcall(function() {
						return messageSchemas;
					}).then(verifyObject.verifyFunction).then(function(object) {

						if (!object.result) {
							var msgSchema = require('../../../schemas/message/' + verifyObject.schemaName);

							createMessageSchema(msgSchema)
								.then(function(json) {
									defer.resolve(json);
								});
						}
						else {
							defer.resolve(object.element);
						}
					});
				}
				else {
					defer.resolve({});
				}
			}
			else {
				defer.resolve({});
			}

			return defer.promise;
		};

		// return a promisse to be executed later and not when createMessageSchema is called with it's parameters
		return q.fcall(execute);
	};

	var createAllSchemas = function(playOrg) {
		var defer = q.defer();

		getMessageSchemas().then(function(messageSchemas) {
			var devices = ['arduino', 'armbed', 'inteledison', 'intelgalileo', 'raspberry', 'sensortag', 'smartphone', 'vehicle'];

			var promises = [];
			for (var i in devices) {
				if (devices[i]) {
					promises.push(createSchema(playOrg, messageSchemas, devices[i]));
				}
			}

			defer.resolve([playOrg, q.all(promises)]);
		});

		return defer.promise;
	};

	var getDeviceType = function(schemaName) {
		for (var fileName in files) {
			if (files.hasOwnProperty(fileName) && files[fileName].name === schemaName) {
				return deviceTypes[fileName];
			}
		}
		return null;
	};

	var object = {
		getMessageSchemas: getMessageSchemas,
		createMessageSchema: createMessageSchema,
		getDeviceType: getDeviceType,
		validateSchemaName: validateSchemaName,

		createAllSchemas: createAllSchemas
	};

	module.exports = object;

})();
/* globals require, module, console */

'use strict';

(function() {

	module.exports = function(server) {
		var express = require('express'),
			router = express.Router();

		var io = require('socket.io')(server);
		io.on('connection', function(socket) {
			console.log('socket connected: ' + socket.id);
		});

		console.log('socket connection was called');

		router.post('/alert', function(req, res) {
			console.log('got alert...');
			console.log(req.body);

			io.emit('alert', req.body);

			res.end();
		});

		return router;
	};

})();
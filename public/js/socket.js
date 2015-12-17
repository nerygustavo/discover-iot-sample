'use strict';
(function() {
	var socket = io();
	socket.on('alert', function(data) {
		console.log(data);
		console.log(data.message);

		$('#lastAlert').html(data.message);
		$('#historicAlerts').append('<pre>' + data.message + '</pre>');
	});
})();
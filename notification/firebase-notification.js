var request = require('request');
var async = require('async');
var user_dao = require('../dao/usuarios_dao');


class Notification{
	constructor(to, title, body){
		this.__inner = {}
		this.__inner.to = to;
		this.__inner.notification = {'title' : title, 'body' : body}
	}

	withClickAction(click_action){
		this.__inner.notification.click_action = click_action;
		return this;
	}

	withData(data){
		this.__inner.data = data;
		return this;
	}

	getNotification(){
		return this.__inner;
	}
}


// Set the headers
var headers = {
    "Content-Type":     "application/json",
	"Authorization":	'key=AIzaSyBZin9Fiei3fCyArpy7biPtxO9GzvoD8m4'
}

// Determine message
var message_content = {
	'REQUEST': ' te pediu uma carona ',
	'OFFER': ' te ofereceu uma carona ',
	'CONFIRM': ' aceitou sua carona ',
	'REJECT': ' não aceitou sua carona '
}

function sendToApi(notification){
	if(notification !== undefined){
		console.log('Starting sendToApi. notification: ' + JSON.stringify(notification));
		let body = notification.getNotification();
		// Configure the request
		let options = {
			url: "https://fcm.googleapis.com/fcm/send",
			headers : headers,
			json : true,

		 	body
		}

		// Dispara a requisição
		request.post(options, function (error, response, body) {
			if (error) console.log(error);
			console.log(options);
			console.log("Erro: "+error);
			console.log("Resposta: "+response);
			console.log("Show me your body: : "+body);
		});
	}
}

// Função pública
exports.sendNotification = function(notification){
	console.log('Inicio sendNotification');

	if(notification !== undefined){
		let users = {};
		async.parallel([
	        //Load user origin
	        function(callback) {
	            user_dao.findUserByRecord(notification.origin, function(err, returned_user){
					if (err) return handleError(err);
					users.origin = returned_user;
					callback();
				});
	        },
	        //Load user destination
	        function(callback) {
	            user_dao.findUserByRecord(notification.destination, function(err, returned_user){
					if (err) return handleError(err);
					users.destination = returned_user;
					callback();
				});
	        }
	    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
	    	console.log('user-origiin ' +  users.origin + ' user-destination: ' + users.destination);
	    	
	    	let notification_obj = new Notification(to=users.destination.firebaseId, title='Partiu IFSP', body=users.origin.name + message_content[notification.action]);

			sendToApi(notification_obj);

	    });

	}
}
// Envia notificação de Caronas a ser aberta na Activity de RideDetails
exports.sendNotificationWithRideDetails = function(notification){
	console.log('Inicio sendNotificationWithRideDetails');

	if(notification !== undefined){
		let users = {}
		async.parallel([
	        //Load user origin
	        function(callback) {
	            user_dao.findUserByRecord(notification.origin, function(err, returned_user){
					if (err) return handleError(err);
					users.origin = returned_user;
					callback();
				});
	        },
	        //Load user destination
	        function(callback) {
	            user_dao.findUserByRecord(notification.destination, function(err, returned_user){
					if (err) return handleError(err);
					users.destination = returned_user;
					callback();
				});
	        }
	    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
	    	console.log('user-origiin ' +  users.origin + ' user-destination: ' + users.destination);
	    	
	    	let notification_obj = new Notification(to=users.destination.firebaseId, title='Partiu IFSP', body=users.origin.name + message_content[notification.action])
								.withClickAction('OPEN_RIDE_DETAIL_ACTIVITY')
								.withData(
									 	{ 'ride' : [ 
										{ 'user_sender' : users.origin },
										{ 'user_recipient' : users.destination },
										{ 'ride_action' : notification.action } ] }
									);

			sendToApi(notification_obj);

	    });

	}
}

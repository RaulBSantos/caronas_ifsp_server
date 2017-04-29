var request = require('request');
var user_dao = require('../dao/usuarios_dao');


class Notification{
	constructor(to, title, body){
		this.__inner = {}
		this.__inner.to = to;
		this.__inner.notification = {'title' : title, 'body' : body}
	}

	withClickAction(clickAction){
		this.__inner.notification.clickAction = clickAction;
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

		let notification_obj = notification.getNotification();			
		// Configure the request
		let options = {
			url: "https://fcm.googleapis.com/fcm/send",
			headers : headers,
			json : true,
			body : 
			{
				 notification_obj
			}
		}

		// Dispara a requisição
		request.post(options, function (error, response, body) {
			if (error) console.log(error);
		});
	}
}

// Função pública
exports.sendNotification = function(notification){
	console.log('Inicio sendNotification');

	if(notification !== undefined){
		var user_name_origin = undefined;
		user_dao.findUserByRecord(notification.origin, function(err, returned_user){
			if (err) return handleError(err);
			
			user_name_origin = returned_user.name;
			
		});

		user_dao.findUserByRecord(notification.destination, function(err, returned_user){
			if (err) return handleError(err);
			
			let notification_obj = new Notification(to=returned_user.firebaseId, title='Partiu IFSP', body=user_name_origin + message_content[notification.action])

			sendToApi(notification_obj);
		});
		
	}
// Envia notificação de Caronas a ser aberta na Activity de RideDetails
exports.sendNotificationWithRideDetails = function(notification){
	console.log('Inicio sendNotificationWithRideDetails');

	if(notification !== undefined){
		var origin_user = undefined;
		user_dao.findUserByRecord(notification.origin, function(err, returned_user){
			if (err) return handleError(err);
			
			origin_user = returned_user;
			
		});

		user_dao.findUserByRecord(notification.destination, function(err, destination_user){
			if (err) return handleError(err);
			
			let notification_obj = new Notification(to=destination_user.firebaseId, title='Partiu IFSP', body=user_name_origin + message_content[notification.action])
								.withClickAction('OPEN_RIDE_DETAIL_ACTIVITY')
								.withData(
									 	{ 'ride' : [ 
										{ 'user_sender' : origin_user },
										{ 'user_recipient' : destination_user },
										{ 'ride_action' : notification.action } ] }
									);

			sendToApi(notification_obj);
		});
	}
};
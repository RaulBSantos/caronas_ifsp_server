var request = require('request');

var user_dao = require('../dao/usuarios_dao');


class Notification{
	constructor(to, title, body){
		this.to = to;
		this.notification = {'title' : title, 'body' : body}
	}

	withClickAction(clickAction){
		this.notification.clickAction = clickAction;
		return this;
	}

	withData(data){
		this.data = data;
		return this;
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

function sendToApi(origin, notification, destination){
	if(destination !== undefined){
			// Configure the request
			var options = {
				url: "https://fcm.googleapis.com/fcm/send",
				headers : headers,
				json : true,
				body : 
				{
					 "to" : destination,
					 "notification" : {
						 "title" : "Partiu IFSP",
						 "body" : origin + message_content[notification.action]
					 }
				}
				//FIXME Configurar o click_action: Intenção de Activity a ser aberta quando clicar
			}

			// Dispara a requisição
			request.post(options, function (error, response, body) {
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
		var user_name_origin = undefined;
		user_dao.findUserByRecord(notification.origin, function(err, returned_user){
			if (err) return handleError(err);
			
			user_name_origin = returned_user.name;
			
		});

		var destination_user = undefined;
		user_dao.findUserByRecord(notification.destination, function(err, returned_user){
			if (err) return handleError(err);
			
			var firebase_id_destination = returned_user.firebaseId;

			sendToApi(user_name_origin, notification, firebase_id_destination);
		});
		
	}
// Envia notificação de Caronas a ser aberta na Activity de RideDetails
exports.sendNotificationWithRideDetails = function(notification){
	// Rascunho
	let promiseUsers = user_dao.findUsersByRecords(notification.origin, notification.destination); // Devolvendo um Promise

	promiseUsers.then(function(users){
		
	});

}
    
}; 	


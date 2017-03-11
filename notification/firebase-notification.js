var request = require('request');

var user_dao = require('../dao/usuarios_dao');
// Set the headers
var headers = {
    "Content-Type":     "application/json",
	"Authorization":	'key=AIzaSyBZin9Fiei3fCyArpy7biPtxO9GzvoD8m4'
}
// Determine message
var message_content = {
	'REQUEST': ' te pediu uma carona ',
	'OFFER': ' te ofereceu uma carona '
}

// Função pública

exports.sendNotification = function(notification){
	console.log('Inicio sendNotification');
	
	

	if(notification !== undefined){
		var origin_user = undefined;
		user_dao.findUserByRecord(notification.origin, function(err, returned_user){
			if (err) return handleError(err);

			origin_user = returned_user;
		});
		
		var destination_user = undefined;
		user_dao.findUserByRecord(notification.destination, function(err, returned_user){
			if (err) return handleError(err);

			destination_user = returned_user;
		});
		
		var destination = destination_user.firebaseId;
		var user_name_origin = origin_user.name;

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
						 "body" : user_name_origin + message_content[notification.action]
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
    
}; 	
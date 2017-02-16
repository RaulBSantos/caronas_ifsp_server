var request = require('request');

// Set the headers
var headers = {
    "Content-Type":     "application/json",
	"Authorization":	'key=AIzaSyBZin9Fiei3fCyArpy7biPtxO9GzvoD8m4'
}


// Função pública

exports.sendNotification = function(notification){
	if(notification !== undefined){
		var destination = notification.destination
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
						 "title" : "Mensagem para o Firebase",
						 "body" : "Teste firebase"
					 }, 
					 "data" : {
					 	"nome" : "Raul",
					 	"sobrenome" : "Bolsonaro"
					 }
				}
				
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
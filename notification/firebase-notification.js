// Android_key: f_fp2i48hGU:APA91bFRg_yHtt5MCEGOahl0dwjyBVGWfyk1kmtQjzgRN5Bvh296BfqXQW_hoyJiRD-IWncCF-st93PHNtI7CqmdccGqgxig1GpAvnaOZy5fORDaw5LWxIJvlAdT1X1v8VWm-of0dBhC

var request = require('request');

// Set the headers
var headers = {
    "Content-Type":     "application/json",
	"Authorization":	'key=AIzaSyBZin9Fiei3fCyArpy7biPtxO9GzvoD8m4'
}


// Função pública
exports.sendNotification = function(){
	// Configure the request
	var options = {
		url: "https://fcm.googleapis.com/fcm/send",
		method : "POST",
		headers : headers,
		form : {
			 to : 'f_fp2i48hGU:APA91bFRg_yHtt5MCEGOahl0dwjyBVGWfyk1kmtQjzgRN5Bvh296BfqXQW_hoyJiRD-IWncCF-st93PHNtI7CqmdccGqgxig1GpAvnaOZy5fORDaw5LWxIJvlAdT1X1v8VWm-of0dBhC',
			 notification : {
								 title : "Mensagem para o Firebase",
								 body : "Teste firebase"
							},
							data : {
								 nome : "Raul",
								 sobrenome : "Bolsonaro"
								 }
		}
		
	}

	// Dispara a requisição
	request(options, function (error, response, body) {
		console.log(options);
		console.log("Erro: "+error);
		console.log("Resposta: "+response);
		console.log("Show me your body: : "+body);
	});
    
};
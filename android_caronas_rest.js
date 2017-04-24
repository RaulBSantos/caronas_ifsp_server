/* ##########
	Rest API
   ##########
*/ 

/*
	Bibliotecas de terceiros
*/

var restify = require('restify'); // REST
var fs = require('fs'); // Manipular arquivos
var log4js = require('log4js'); // Logs
/*
	Configuração do log
*/
log4js.clearAppenders(); // Para remover a saída padrão para o console
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/caronas-ifsp.log'), 'caronas-ifsp');
var logger = log4js.getLogger('caronas-ifsp');

/*
	Bibliotecas próprias
*/
logger.debug('Carregando as dependências próprias...')
var moodle_auth = require('./moodle/moodle-validation');
var notification = require('./notification/firebase-notification');
var user_dao = require('./dao/usuarios_dao');

/*
 	Certificado SSL
*/
var optionsServer = {
  key : fs.readFileSync('ssl_keys/privkey1.pem'),
  certificate : fs.readFileSync('ssl_keys/fullchain1.pem')
};

// Criação do servidor REST
var server = restify.createServer(optionsServer);
server.use(restify.acceptParser(server.acceptable));
server.use(restify.jsonp());
server.use(restify.bodyParser({mapParams : true}))

/*
 	Rotas de URL's e respectivas funções
*/

// Função de login
server.post('/caronas/login',function(req, res) {
  var record_value = req.params.record;
  var pass_value = req.params.password;
	
  console.log('Tetando logn: '+ record_value + ' : '+pass_value)


  var response_object;
  // Boolean - Usuário já existe na base de dados do Servidor?
  var isUserRegistred;

  // Busca o usuário no banco de dados do Servidor, caso não encontre, devolve 302 para o usuário se cadastrar
  user_dao.findUserByRecord(record_value, function(err,user_model){
    
    isUserRegistred = user_model !== null;
    
    moodle_auth.checkUserExists(record_value, pass_value, res, function(isMoodleUserOk, res){ 
    var response_object;
      // Usuário está ativo no Moodle?
      if(isMoodleUserOk){
        // Usuário já está cadsatrado no Servidor de Caronas?
        if(isUserRegistred){
          response_object = JSON.stringify({'status_code' : 200 , 'user' : user_model});
        }else{
          // Irá redirecionar para a tela de cadastro
          response_object = JSON.stringify({'status_code' : 302 , 'user' : {'record' : record_value}});
        }
        
      }else{
        response_object =  JSON.stringify({'status_code' : 401 , 'user' : undefined });
      }
      console.log("Pront: "+ record_value +", Senha: "+  "pass_value" + " Response: "+response_object);

      res.write(response_object);	
      res.end();
    });

  });


});

// Notificação de carona
server.post('/caronas/notification',function(req, res) {

	// origin_user = user_dao.findUserByRecord(req.params.origin);
	// origin_user = user_dao.findUserByRecord(req.params.destination);
	notification.sendNotification(req.params);
	// console.log(req.params.action);
	// console.log(req.params.destination);
	res.send(200);
  
});

server.post('/caronas/notification/confirm-ride', function(req, res){
  // Envia notificação ao usuário "Carona não foi aceita"
  // Salva no banco?? Carona como rejeitada??? 
  logger.info('Carona confirmada! Origem: ' + req.params.origin + ' Destino: ' + req.params.destination + ' Ação: ' + req.params.action)
  notification.sendNotificationWithRideDetails(req.params);

  res.send(200);
});

server.post('/caronas/notification/reject-ride', function(req, res){
  // Envia notificação ao usuário "Carona não foi aceita"
  // Salva no banco?? Carona como rejeitada??? 
  logger.info('Carona rejeitada! Origem: ' + req.params.origin + ' Destino: ' + req.params.destination + ' Ação: ' + req.params.action)
  notification.sendNotification(req.params);
  res.send(200);

});



// Função que registra o usuário recebido por JSON
server.post('/caronas/register_user_and_coordinates',function(req, res) {
  var latitude_value = req.params.latitude;


  var longitude_value = req.params.longitude;
  var name_value = req.params.name;
  var record_value = req.params.record;
  var firebaseId_value = req.params.firebaseId;
  
  var can_give_ride = req.params.canGiveRide;

  console.log("lat: "+latitude_value + "lon "+longitude_value+ "name "+name_value + "rec : "+record_value+" pode dar carona: " + can_give_ride +" firebaseId: "+firebaseId_value);

  // Cria um objeto User
  var user = new user_dao.User({name : name_value, record : record_value, 
                  canGiveRide : can_give_ride,
                  location : {latitude : latitude_value, longitude : longitude_value},
                  firebaseId : firebaseId_value
             });

  user_dao.saveUser(user);

  res.send(200);
});

// Função que registra uma carona ao usuário
server.post('/caronas/register_ride',function(req, res) {
  var jsonRide = req.params.nameValuePairs;
  console.log(jsonRide.driver);
  console.log(jsonRide.daysOfWeek);
  console.log(jsonRide.ways);

  // Cria um objeto User
  var user = new user_dao.User({record : jsonRide.driver.record });
  // Cria um objecto Ride
  var ride = new user_dao.Ride({daysOfWeek : jsonRide.daysOfWeek, ways : jsonRide.ways});

  // Adiciona a carona ao Usuário
  user.ridesOffer.push(ride);

  user_dao.findOneAndUpdate(user);


  res.send(200);
});

// *** APENAS PARA TESTE !!! *** Função que retorna todos os dados registrados no banco
server.get('/caronas/getAllUsersAndPools',function(req, res) {

  user_dao.findAllUsers(function(users){
    var bodyHtml = JSON.stringify(users);
    // Teste
    console.log("body: "+bodyHtml);

    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(bodyHtml),
      'Content-Type': 'application/json'
    });
    res.write(bodyHtml);
    res.end();
  })

  
});

// Test filtering
server.get('/caronas/getRides',function(req, res) {
  var search_ride = req.params.canGiveride;
  var bodyHtml = "";

  if (search_ride === undefined || search_ride ===''){
    console.log("Returned void");
  }else{
    search_ride = !search_ride;
    var bodyHtml = JSON.stringify(getDb().getRides(search_ride));

    console.log(bodyHtml);
  }
  res.writeHead(200,{
    'Content-Type':'application/json',
    'Content-Length':Buffer.byteLength(bodyHtml)
  });

  res.write(bodyHtml);
  res.end();

});

// Recebe os dados para enviar para a APIGoogleDirections
server.post('/caronas/sendToDirectionsApi',function(req, res) {
  var path = "http://maps.googleapis.com/maps/api/directions/json?";
  var origin = req.params.origin;
  var destination = req.params.destination;
  var waypoints = req.params.intermediate;

  console.log(req.params.origin);
  console.log(req.params.destination);
  console.log(req.params.intermediate);
  
  //  lat/lng : (-22.8724543,-46.7909133)
  // lat/lng : (-22.8724543,-46.7909133)
  // "parse"
  /*if(origin !== undefined && destination !== undefined){
    origin = "origin="+parseToApiCoordinates(req.params.origin);
    destination = "destination="+parseToApiCoordinates(req.params.destination);

    /*
    path += origin + destination;
    if(waypoints !== undefined){
      waypoints = "waypoints="+parseToApiCoordinates(req.params.intermediate);
      path += waypoints;
    }
    
    var headers = {
        'User-Agent': 'Super Agent/0.0.1'
    }

    var options = {
      url : path,
      method : 'GET',
      headers: headers
    }
    
    // Send request
    request(options, function(error, response, body){

    });  


   

  }
   */

  var response_code;
  res.send(response_code);
});

/*
var parseToApiCoordinates = function(obj){

  var ret = obj.substring(obj.indexOf("(") + 1,obj.indexOf(")"));
  return ret
};


*/



// Returns 10 nearst users
server.get('/getNeartesUsersAndPools',function(req, res) {

  var latitude_value = req.params.latitude;
  var longitude_value = req.params.longitude;
  var can_give_ride = req.params.canGiveride;

  var bodyHtml = JSON.stringify();

  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(bodyHtml),
    'Content-Type': 'application/json'
  });
  res.write(bodyHtml);
  res.end();


});


// *** APENAS PARA TESTE !!! ***Home page
server.get('/',function(req, res) {
  var bodyHtml = '<!DOCTYPE html><html><head><title>'
  + 'Teste Node.js - Validando o servidor..</title></head>'
  + '<body>'
  + '<br/>Ok, funcionando';


  bodyHtml += '</code></pre></body></html>';
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(bodyHtml),
    'Content-Type': 'text/html'
  });
  res.write(bodyHtml);
  res.end();
});


// Start server
server.listen(8080, function() {
  console.log('Online: 8080');
});

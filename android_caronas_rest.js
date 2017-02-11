/*
/*
Mongo DataBase
*/
// Mongoose - API para utilizar o mongoDB
/*

var mongoose = require('mongoose');

var db_2 = mongoose.connection;

db_2.on('error', console.error);
db_2.once('open', function(){
  console.log('Conectado ao mongoDB');

  mongoose.Promise = require('bluebird');
  mongoose.connect('mongodb://localhost/test');


});

var Schema = mongoose.Schema;

var caronaSchema = new Schema({
  ativa : Boolean,
  vagas : Number
});

var Carona = mongoose.model('Carona', caronaSchema);

var usuarioSchema = new Schema({
  nome : String,
  prontuario : String,
  senha : String,
  telefone : String,
  podeDarCarona: Boolean,
  localPartida : {latitude : Number, longitude : Number },
});

var Usuario = mongoose.model('Usuario', usuarioSchema);



*/
// Testing MongoDB
/*var raulUser = new usuarioSchema({ nome : "Raul",prontuario : "136208-9",
senha : "senha",
telefone : "99843-0260",
podeDarCarona: true,
localPartida : {latitude : 22, longitude : 26 }
});
var caronaTest = new Carona({ ativa : false, vagas : 2 });






// Test Find

/*
Objects that API Rest uses


*/

var underscore = require('underscore');

// Array to storage the Database - Create as Object Oriented
function DB(){
  this.users_array =[];
}

// Methods of DB
DB.prototype.addUser = function(user){
  this.users_array.push(user);
};

DB.prototype.getAllUsers = function(){
  return this.users_array;
};

DB.prototype.getRides = function (search_ride) {
    return _.filter(this.getAllUsers, {can_give_ride : search_ride});
};

var db_test = undefined;

var getDb = function(){
  // If already exists, get the same, else create a new
  db_test = db_test || new DB();

  return db_test;
};

/*
function User(id_value, name_value, record_value, password_value, latitude_value, longitude_value,can_give_ride_value,vacancy){
  this.id = id_value;
  this.name = name_value;
  this.record = record_value;
  this.password = password_value;
  this.phone = undefined;
  this.latitude = latitude_value;
  this.longitude = longitude_value;
  this.can_give_ride = can_give_ride_value;
  this.vacancy = vacancy;
}

*/


/*
Rest API
*/

// importa a bibliioteca retify e fs
//var request = require('request');
var restify = require('restify');
var fs = require('fs');
// Arquivo para autenticação com o moodle
var moodle_auth = require('./moodle/moodle-validation');
// Arquivo para gerenciar notificações do Firebase
var notification = require('./notification/firebase-notification');

var user_dao = require('./dao/usuarios_dao');

// Opções do servidor - Utilizar um certificado SSL
var optionsServer = {
  key : fs.readFileSync('ssl_keys/privkey1.pem'),
  certificate : fs.readFileSync('ssl_keys/fullchain1.pem')
};

// Sintaxe para criar um server
var server = restify.createServer(optionsServer);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.jsonp());
server.use(restify.bodyParser({mapParams : true}))

// method Receives JSON login
server.post('/caronas/login',function(req, res) {
  var record_value = req.params.record;
  var pass_value = req.params.password;

  var response_code;
  // Boolean - Usuário já existe na base de dados do Servidor?
  var isUserRegistred;

  var userToRegister = new user_dao.User({record : record_value });
  // Busca o usuário no banco de dados do Servidor, caso não encontre, devolve 302 para o usuário se cadastrar
  user_dao.findUserByRecordSendStatus(userToRegister, function(err,model){
    
    isUserRegistred = model !== null;
    
    moodle_auth.checkUserExists(record_value, pass_value, res, function(isMoodleUserOk, res){ 
    var response_code;
      // Usuário está ativo no Moodle?
      if(isMoodleUserOk){
        // Usuário já está cadsatrado no Servidor de Caronas?
        if(isUserRegistred){
          response_code = 200;
        }else{
          // Irá redirecionar para a tela de cadastro
          response_code = 302;
        }
        
      }else{
        response_code = 401;
      }
      console.log("Pront: "+ record_value +", Senha: "+  "pass_value" + " Response: "+response_code);

      res.send(response_code);
    });

  });


});

// Teste Firebase
server.get('/firebase',function(req, res) {
  console.log(req);
  notification.sendNotification();
  res.end();
});

// method Receives JSON user and coordinates
server.post('/caronas/register_user_and_coordinates',function(req, res) {
  var latitude_value = req.params.latitude;
  var longitude_value = req.params.longitude;
  var name_value = req.params.name;
  var record_value = req.params.record;
  var firebaseId_value = req.params.firebaseId;
  
  var can_give_ride = req.params.canGiveRide;

  console.log("lat: "+latitude_value + "lon "+longitude_value+ "name "+name_value + "rec : "+record_value+" pode dar carona: " + can_give_ride +" firebaseId: "+firebaseId_value);


  //var firebase_id_value = req.params.firebaseId;

  //console.log("firebaseId : "+firebase_id_value);

  // Cria um objeto User
  var user = new user_dao.User({name : name_value, record : record_value, 
                  canGiveRide : can_give_ride,
                  location : {latitude : latitude_value, longitude : longitude_value},
                  firebaseId : firebaseId_value
             });
  //FIXME Testar
  user_dao.saveUser(user);

  res.send(200);
});

// Register ride
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

// Returns all users
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


// Home page:
server.get('/',function(req, res) {
  var bodyHtml = '<!DOCTYPE html><html><head><title>'
  + 'Teste Node.js - O Bom Programador</title></head>'
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




// Teste Mongo Db
server.get('/caronas/teste-write',function(req, res) {
  
  console.log("Criando um usuário");

  var testeUser = new user_dao.User({
    name : "Maria",
    record : "12345678",
    location : {latitude : 1345, longitude : 5432},
    canGiveRide : true,
  });
  console.log("Chamando o método de user_dao.saveUser(user)");
  console.log(testeUser);
  user_dao.findOneAndUpdate(testeUser);


});

server.get('/caronas/teste-read',function(req, res) {
  
  user_dao.findUserByRecord("136208-9", function(doc){
    if(doc === null || doc === undefined)
      // Responde que será preciso se cadastrar
      console.log("não encontrado");
  });
  console.log('doc = '+ doc+'test');

  res.send(200);
});

// Start server
server.listen(8080, function() {
  console.log('Online: 8080');
});

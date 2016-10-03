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
/*
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

var db = undefined;

var getDb = function(){
  // If already exists, get the same, else create a new
  db = db || new DB();

  return db;
};

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
var restify = require('restify');
var fs = require('fs');

var moodle_auth = require('./moodle-validation');

// Sintaxe para criar um server
var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.jsonp());
server.use(restify.bodyParser({mapParams : true}))

// method Receives JSON login
server.post('/caronas/login',function(req, res) {
  var record_value = req.params.record;
  var pass_value = req.params.password;

  var response_code;

  moodle_auth.checkUserExists(record_value, pass_value, res, function(isMoodleUserOk, res){ 
    var response_code;

      if(isMoodleUserOk){
        getUserInformation
        response_code = 200;
      }else{
        response_code = 401;
      }
      console.log("Pront: "+ record_value +", Senha: "+  pass_value + " Response: "+response_code);
      res.send(response_code);
    });
});

// method Receives JSON user and coordinates
server.post('/caronas/register_user_and_coordinates',function(req, res) {
  var latitude_value = req.params.latitude;
  var longitude_value = req.params.longitude;
  var name_value = req.params.name;
  var record_value = req.params.record;
  var password_value = req.params.password;
  var can_give_ride = req.params.canGiveRide;
  var vacancy = req.params.vacancy;



  var user = new User(getDb().getAllUsers().length ,name_value, record_value, password_value, latitude_value, longitude_value, can_give_ride, vacancy);

  getDb().addUser(user);

  console.log('User: '+name_value+' Record:  '+record_value+' Password: '+password_value);
  console.log('\nlat: '+latitude_value+' lon: '+longitude_value);
  console.log('\n Oferece carona? ' +can_give_ride);
  if(can_give_ride){
    console.log('\n Vagas: ' +vacancy);
  }
  console.log('\n\n\n***');
  console.log("Content of array: " + getDb().getAllUsers() + "\n *** \t Number of entries: "+ getDb().getAllUsers().length);

  res.send(200);
});
// Returns all users
server.get('/caronas/getAllUsersAndPools',function(req, res) {
  var bodyHtml = JSON.stringify(getDb().getAllUsers());

  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(bodyHtml),
    'Content-Type': 'application/json'
  });
  res.write(bodyHtml);
  res.end();
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

/*

// Teste Mongo Db
server.get('/caronas/teste-write',function(req, res) {
  
  console.log("Criando uma Carona com 'promise'..");

  var testeCarona = new Carona({
    ativa : true ,
    vagas : 69
  });

  var promise = testeCarona.save(); 
  
  promise.then(function(caronas){
    console.log("Info: "+caronas);
    console.log("Carona criada com sucesso");
    res.write(testeCarona);
    res.send(response_code);
  })
  .catch(function(err){
    console.log('Erro: ', err);
    res.send(response_code);
  });

});

server.get('/caronas/teste-read',function(req, res) {
  
  console.log("Buscando todas as caronas");

  Carona.find(function (err, caronas){
    if(err) throw err;
    res.write(caronas);
    console.log(caronas);
  });

  

  res.send(response_code);
});

*/

// Start server
server.listen(8080, function() {
  console.log('Online: 8080');
});


// Just to console Test
/*

var funnctionRest = function(){
  var latitude_value = "req.params.latitude";
  var longitude_value = "req.params.longitude";
  var name_value = "req.params.name";
  var record_value = "req.params.record";
  var password_value = "req.params.password";

  var user = new User(getDb().getAllUsers().length ,name_value, record_value, password_value, latitude_value, longitude_value);

  getDb().addUser(user);

  console.log('User: '+name_value+' Record:  '+record_value+' Password: '+password_value);
  console.log('\nlat: '+latitude_value+' lon: '+longitude_value);
  console.log('\n\n\n***');
};

*/

// Android Sends realtime location and canGivePool of especific user. Receives the most near User's name and location - to draw on map

// Server Sends Json filtering by min difference between Android user and the DB Users - Too Filtering if canGivePool its true or false (Two different methods)

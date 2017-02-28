// Objetos para manusear promises
var assert = require('assert');
var Promise = require('mpromise');
var promise = new Promise;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/caronas');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // Conectado
  // Criando um Schema de carona
  var rideSchema = mongoose.Schema({
  	daysOfWeek : [String],
  	ways : [{
  		direction : {type : String}, time :{type : String}, vacancyNumber : {type : Number}
  	}],
  	route : {},
  	usersPending : []
  });

  var Ride = mongoose.model('Ride', rideSchema);

  exports.Ride = Ride;

  // Criando um Schema do usuário
  var userSchema = mongoose.Schema({
  	name : {type : String},
  	record : {type : String, unique : true},
  	firebaseId : {type : String, unique: true},
  	canGiveRide : {type : Boolean},
  	phone : {type : String},
  	email : {type : String}.
  	location : {latitude : Number, longitude : Number},
  	ridesOffer : [rideSchema],
  	ridesAsked : [{
  		rideId 		: {type : String}, 
  		driverId 	: {type : String} }]
  });
  // Convertendo o Schema em um Model do usuário
  var User = mongoose.model('User', userSchema);
  // Tornando pública
  exports.User = User;
});

// Funções públicas

// Salva um usuário
exports.saveUser = function(user){
	console.log('saveUser()'+user);
	user.save();
	/*
	var promise = user.save();

	assert.ok(promise instanceof require('mpromise'));
	*/
    
};

exports.findUserByRecord = function(record, callback){
	exports.User.findOne({record : record}, callback);
};
// Update or insert 
exports.findOneAndUpdate = function(user){
	// Deleta o novo id criado, para o documento continuar com o mesmo id
	// caso já exista
	var userObj = user.toObject();
	delete userObj._id;
	exports.User.findOneAndUpdate(
		{record : user.record}, // Query para buscar
		userObj,// Documento que será inserido caso nada seja encontrado
		{upsert: true, new : true}, function(err, doc){
			if(err){
				console.error(err);
			}else{
				console.log(doc);
			}

		});
};

exports.findAllUsers = function(callback){
	exports.User.find(function (err,users){
		if(err) return console.error(err);
		console.log(users);
		// Executa função de callback com o retorno
		callback(users);
	})
};

exports.saveRideIntoUser = function(ride, user){
	console.log(user);
	user.ridesOffer.push(ride);
	console.log("saving ride in user...");
	exports.findOneAndUpdate(user);

}
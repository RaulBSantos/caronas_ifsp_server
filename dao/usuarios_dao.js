// Objetos para manusear promises
var assert = require('assert');
var Promise = require('mpromise');
var promise = new Promise;
var async = require('async');

var mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/caronas');

var db = mongoose.connection;
var User = undefined;
var Ride = undefined;


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // Conectado 
  // Criando um Schema de carona
  var rideSchema = mongoose.Schema({
	 user : { name : {type : String }, record : { type : String }, phone : {type : String}, email : {type : String},
		location : { latitude : {type : Number}, longitude : {type : Number}}
	 },
	 driver : { type : Boolean },
	 dateRequest : { type : Date},
	 dateResponse : { type : Date}
  });

  Ride = mongoose.model('Ride', rideSchema);

  exports.Ride = Ride;

  // Criando um Schema do usuário
  var userSchema = mongoose.Schema({
  	name : {type : String},
  	record : {type : String, unique : true},
  	firebaseId : {type : String, unique: true},
  	canGiveRide : {type : Boolean},
  	phone : {type : String},
  	email : {type : String},
  	location : { latitude : {type : Number}, longitude : {type : Number}},
  	confirmedRides : [rideSchema],
  	rejectedRides : [rideSchema]
  });
  // Convertendo o Schema em um Model do usuário
  User = mongoose.model('User', userSchema);

  // Tornando pública
  exports.User = User;
});

// Funções públicas

// Salva um usuário
exports.saveUser = function(user){
	console.log('saveUser()'+user);
	user.save();
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

exports.addRide = function(askingUserRecordId, offerUserRecordId, isConfirm){
	// Find other User
	console.log('***Starting addRide***');
	var askingUser = undefined;
	var offerUser = undefined;
	
	async.parallel([
        //Load user origin
        function(callback) {
        	User.find({ 'record' : offerUserRecordId }
        		, 'name record phone email location', 
        		function (err, doc_user) {
        			if (err) return handleError(err);
        			offerUser = doc_user[0];
        			console.log('Finded  %s %s ', offerUser.name, offerUser.record);
        			callback();
				});
        },
        //Load user destination
        function(callback) {
            User.find({ 'record' : askingUserRecordId }
        		, 'name record phone email location', 
        		function (err, doc_user) {
        			if (err) return handleError(err);
        			delete doc_user._id;
        			askingUser = doc_user[0];
        			console.log('Finded  %s %s ', askingUser.name, askingUser.record);
        			callback();
				});
        }
    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
    	console.log(offerUserRecordId + ' | ' + ' | ' + askingUserRecordId);
    	// Update
    	if ( isConfirm ){
    		console.log('*+*+* IS CONFIRM *+*+*');
	    	User.update(
			    { 'record' : offerUserRecordId },
			    { "$push": { "confirmedRides" :  { user : askingUser, driver : false, dateRequest : Date.now() }  } },
		    function(err,numAffected) {
		       // something with the result in here
		       console.log('Updated ' + offerUserRecordId + '. Rows affected: ' + JSON.stringify(numAffected));
		    });

		    User.update(
			    { 'record' : askingUserRecordId },
			    { "$push": { "confirmedRides" :  { user : offerUser, driver : true, dateRequest : Date.now() } } },
		    function(err,numAffected) {
		       // something with the result in here
		       console.log('Updated ' + askingUserRecordId + '. Rows affected: ' + JSON.stringify(numAffected));
		    });
		}else{
			console.log('*+*+* IS REJECT *+*+*');
			User.update(
			    { 'record' : offerUserRecordId },
			    { "$push": { "rejectedRides" :  { user : askingUser, driver : false, dateRequest : Date.now() }  } },
		    function(err,numAffected) {
		       // something with the result in here
		       console.log('Updated ' + offerUserRecordId + '. Rows affected: ' + JSON.stringify(numAffected));
		    });

		    User.update(
			    { 'record' : askingUserRecordId },
			    { "$push": { "rejectedRides" :  { user : offerUser, driver : true, dateRequest : Date.now() } } },
		    function(err,numAffected) {
		       // something with the result in here
		       console.log('Updated ' + askingUserRecordId + '. Rows affected: ' + JSON.stringify(numAffected));
		    });
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
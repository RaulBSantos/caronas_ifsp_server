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
  // Criando um Schema do usuário
  var userSchema = mongoose.Schema({
  	name : String,
  	record : String,
  	firebaseId : String,
  	canGiveRide : Boolean,
  	location : {latitude : Number, longitude : Number},
  	ridesOffer : [{ 
  		goTime : Date, backTime : Date, vacancy : Number, 
  		routes : [{latitude : Number, longitude : Number }] 
  	}],
  	ridesAsked : [{
  		rideId 		: String, 
  		driverId 	: String }]
  });
  // Definindo os métodos estáticos

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
// Busca um usuário por prontuário, executa a função de callback após a busca
exports.findUserByRecordSendStatus = function(user, callback){
	var userExists;
	console.log('findUser()' + user);

	//var query = 
	exports.User.findOne({record : user.record}, callback);
	/*
	assert.ok(!(query instanceof require('mpromise')));

	query.then(function(doc){
		// Checa se usuário existe na base
		userExists = (doc !== null && doc !== undefined);
		
	});

	var promise = query.exec();
	assert.ok(promise instanceof require('mpromise'));


	*/

	// Envia o resultado

};

exports.findUserByRecord = function(user){
	console.log('findUser()' + user);

	var query = exports.User.findOne({record : user.record});
	assert.ok(!(query instanceof require('mpromise')));

	query.then(function(doc){
		console.log("Encontrou o doc: "+doc);
	});

	var promise = query.exec();
	assert.ok(promise instanceof require('mpromise'));

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
				console.log(err);
			}else{
				console.log(doc);
			}

		});
};

/*

var modelDoc = new MyModel({ foo: 'bar' });

MyModel.findOneAndUpdate(
    {foo: 'bar'}, // find a document with that filter
    modelDoc, // document to insert when nothing was found
    {upsert: true, new: true, runValidators: true}, // options
    function (err, doc) { // callback
        if (err) {
            // handle error
        } else {
            // handle document
        }
    }
)
*/
// Importa bibliotecas do MongoDB e assert (para validação)
var MongoClient = require('mongodb').MongoClient, assert = require('assert');

// Conectando à URL do mongoDB
var url = 'mongodb://localhost:27017/caronas';

// Usando o método connect para se conectar ao banco
exports.listAll = function(){
	MongoClient.connect(url, function(err, db){
		assert.equal(null, err);
		
		findAllDocuments(db, function(){
			db.close();
		});
	});
};



var findAllDocuments = function(db, callback){
	// Pega a coleção de documentos
	var collection = db.collection('caronas');

	// Busca alguns documentos
	collection.find({}).toArray(function(err,docs){
		assert.equal(err, null);
		console.log("Encontrados os seguintes registros: ");
		console.log(docs);
		callback(docs);
	});
};
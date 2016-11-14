var request = require('request');

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}


// Funnção pública
exports.checkUserExists = function(record, pass, res, callback){
	existsUser = false;
	// Configure the request
	var options = {
	    url: 'http://moodle.bra.ifsp.edu.br/login/index.php',
	    method: 'POST',
	    headers: headers,
	    form: {username : record, password : pass, Submit : "Login"}
	}
	// Start the request
	request(options, function (error, response, body) {
	    if (!error && response.statusCode == 303) {
	    	existsUser = true;
	    }
	    
	    callback(existsUser, res);
    
	})
};

//var test = checkUserExists('136208-9','senhaerrada', function(existsUser){console.log(existsUser)});
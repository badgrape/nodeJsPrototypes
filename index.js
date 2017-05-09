var http = require('http');
var mysql = require('mysql');

// Add your own user and password strings
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : '',
  password : '',
  database : 'prototype'
});

// Re MySQL:
// connection.connect() unnecessary: implicity established by invoking query.
// connection.end() throws error: cannot enqueue handshake after invoking quit.

var server = http.createServer(function(req, res) {
  if (req.method.toLowerCase() === 'post') {
    // String to receive JSON data from client
    var formData = '';

    req.on('error', function(err) {
      console.error(err);
    }).on('data', function(data) {
      // Capture client data
      formData = data;
    })

    req.on('end', function() {
      res.on('error', function(err) {
        console.error(err);
      });

      // Convert data string to JS object
      postData = JSON.parse(formData);
      console.log(postData); // debugging

      // Response headers
      res.writeHead(200, {
        'Content-Type': 'application/JSON',
        // Allow server response to be shared with local JS script.
        // May not be necessary on live website.
        'Access-Control-Allow-Origin': '*'
      });

      // Insert client data and then retreive all records
      dbOps(postData, res);
    })
  }

  else {
    // Server accepts only POST requests
    res.statusCode = 400;
    res.end();
  }
}).listen(8080);

function dbOps(postData, res) {

  // Node.js equivalent of a prepared statement:
  // Using '?' identifier runs connection.escape() method internally
  // https://www.npmjs.com/package/mysql#escaping-query-values
  connection.query('INSERT INTO protodata SET ?', postData, function (error, results, fields) {
    if (error) {throw error;}
  });

  // Reponse data sent to client in callback
  connection.query('SELECT * from protodata', function (error, results, fields) {
    if (error) {throw error;}

    console.log(results); // debugging

    // Send JSON string to client
    res.write(JSON.stringify(results));
    res.end();
  });

}

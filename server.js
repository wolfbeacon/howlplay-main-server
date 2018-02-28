//Imports and Requirements
var restify = require('restify');

//Global Constants
var WIP = "Endpoint not implemented yet";

// Start Server
var server = restify.createServer();

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

// Quiz End Points
server.post('/quiz', function(req, res, next) {
  res.send(200, WIP);
  next();
});
server.get('/quiz/:id', function(req, res, next) {
  res.send(200, WIP);
  next();
});
server.patch('/quiz/:id', function(req, res, next) {
  res.send(200, WIP);
  next();
});
server.post('/quiz/answers/', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Create New Quiz
// Get Quiz
// Update Quiz
// Upload Answe

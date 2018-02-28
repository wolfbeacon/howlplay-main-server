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
// Creat New Quiz
server.post('/quiz', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Get Quiz
server.get('/quiz/:id', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Update Quiz
server.patch('/quiz/:id', function(req, res, next) {
  res.send(200, WIP);
  next();
});
// Upload Answers
server.post('/quiz/answers/', function(req, res, next) {
  res.send(200, WIP);
  next();
});

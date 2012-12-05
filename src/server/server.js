"use strict";

var http   = require("http");
var server;

exports.start = function(portNumber) {
  if (!portNumber) throw("requires port number");

  server = http.createServer();

  server.on("request", function(request, response) {
    response.statusCode = 200;
    response.end("Hello World!");
  });

  server.listen(portNumber);
};

exports.stop = function(callback) {
  server.close(callback);
};
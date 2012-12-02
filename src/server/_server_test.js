"use strict";

var server = require("./server.js");
var http   = require("http");

exports.tearDown = function(done) {
  
  server.stop(function() {
    done();
  });
};

exports.test_ServerRespondsToGet = function(test) {
  server.start();

  http.get("http://localhost:8080", function(response) {
  	test.done();
  });
};

exports.test_serverReturnsHelloWorld = function(test) {
  server.start();

  var request = http.get("http://localhost:8080");
  request.on("response", function(response) {
  	var receivedData = false;
  	response.setEncoding("utf8");
  	test.equals(200, response.statusCode, "status code");

    response.on("data", function(chunk) {
      receivedData = true;
      test.equals("Hello World!", chunk, "response text");
    });

    response.on("end", function() {
      test.ok(receivedData, "recieved data from server");
      test.done();
    });
  });
};
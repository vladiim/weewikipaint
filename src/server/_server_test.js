"use strict";

var server    = require("./server.js");
var http      = require("http");
var fs        = require("fs");
var TEST_FILE = "generated/test/test.html"
var assert    = require("assert");

exports.tearDown = function(done) {
  if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
    assert.ok(!fs.existsSync(TEST_FILE), "could not delete file [" + TEST_FILE + "]");
  }

  done();
};

exports.test_serverServesAFile = function(test) {
  // var testDir  = "generated/test";
  // var TEST_FILE = testDir + "/test.html";
  var testData = "FILE DATA";

  fs.writeFileSync(TEST_FILE, testData);

  server.start(TEST_FILE, 8080);
  var request = http.get("http://localhost:8080");

  request.on("response", function(response) {
    var receivedData = false;
    response.setEncoding("utf8");
    test.equals(200, response.statusCode, "status code");

    response.on("data", function(chunk) {
      receivedData = true;
      test.equals("FILE DATA", chunk, "response text");
    });

    response.on("end", function() {
      test.ok(receivedData, "recieved data from server");
      server.stop(function() {
        test.done();
      });
    });
  });
};

exports.test_serverRequiresFileToServe = function(test) {
  test.throws(function() {
    server.start(8080);
  });
  test.done();
};

exports.test_serverRequiresPortNumber = function(test) {
  test.throws(function() { server.start(); });
  test.done();
};

exports.test_serverRunsCallbackWhenStopCompletes = function(test) {
  server.start(TEST_FILE, 8080);
  server.stop(function() { test.done(); });
};

exports.test_stopCalledWhenServerIsntRunningThrowsException = function(test) {
  test.throws(function() { server.stop(); });
  test.done();
};
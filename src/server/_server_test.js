(function() {

  "use strict";
  
  var server    = require("./server.js");
  var http      = require("http");
  var fs        = require("fs");
  var assert    = require("assert");

  var TEST_HOMEPAGE = "generated/test/testHome.html";
  var TEST_404      = "generated/test/test404.html";

  exports.tearDown = function(done) {
    cleanUpFile(TEST_HOMEPAGE);
    cleanUpFile(TEST_404);
    done();
  };
  
  exports.test_servesHomepageFromFile = function(test) {
    var testData = "HOMEPAGE DATA";
    fs.writeFileSync(TEST_HOMEPAGE, testData);

    httpGet("http://localhost:8080", function(response, responseData) {
      test.equals(200, response.statusCode, "status code");
      test.equals("HOMEPAGE DATA", responseData, "response text");
      test.done();
    });
  };

  exports.test_returns404FromFileForEverythingButHomepage = function(test) {
    var testData = "404 DATA";
    fs.writeFileSync(TEST_404, testData);

    httpGet("http://localhost:8080/fail", function(response, responseData) {
      test.equals(404, response.statusCode, "status code");
      test.equals("404 DATA", responseData, "response text");
      test.done();
    });
  };

  exports.test_returnsHomepageWhenAskedForIndex = function(test) {
    fs.writeFileSync(TEST_HOMEPAGE, "foo");

    httpGet("http://localhost:8080/index.html", function(response, responseData) {
      test.equals(200, response.statusCode, "status code");
      test.done();
    });
  };

  exports.test_requiresHomepageParameter = function(test) {
    test.throws(function() {
      server.start(8080);
    });
    test.done();
  };

  exports.test_requires404PageParameter = function(test) {
    test.throws(function() {
      server.start(TEST_HOMEPAGE, TEST_404);
    });
    test.done();
  };

  exports.test_requiresPortNumber = function(test) {
    test.throws(function() { server.start(); });
    test.done();
  };
  
  exports.test_runsCallbackWhenStopCompletes = function(test) {
    server.start(TEST_HOMEPAGE, TEST_404, 8080);
    server.stop(function() { test.done(); });
  };
  
  exports.test_stopThrowsExceptionWhenNotRunning = function(test) {
    test.throws(function() { server.stop(); });
    test.done();
  };

  function httpGet(url, callback) {
    server.start(TEST_HOMEPAGE, TEST_404, 8080);
    var request = http.get(url);
  
    request.on("response", function(response) {
      var receivedData = "";
      response.setEncoding("utf8");
  
      response.on("data", function(chunk) {
        receivedData += chunk;
      });
  
      response.on("end", function() {
        server.stop(function() {
          callback(response, receivedData);
        });
      });
    });
  }

  function cleanUpFile(file) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      assert.ok(!fs.existsSync(file), "could not delete file [" + file + "]");
    }
  }

})();
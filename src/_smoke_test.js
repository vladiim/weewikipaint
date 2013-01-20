(function() {

  "use strict";

  var jake          = require("jake");
  var child_process = require("child_process");
  var http          = require("http");
  var child;

  exports.setUp = function(done) {
    runServer(done);
  };

  exports.tearDown = function(done) {
    child.on("exit", function(code, signal) {
      done();
    });

    child.kill();
  };

  exports.test_canGetHomepage = function(test) {
    httpGet("http://localhost:8080", function(response, receivedData) {
      var foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
      test.ok(foundHomePage, "homepage should have contained WeeWikiPaint marker");
      test.done();
    });
  };

  exports.test_canGet404Page = function(test) {
    httpGet("http://localhost:8080/fail", function(response, receivedData) {
      var found404Page = receivedData.indexOf("WeeWikiPaint 404") !== -1;
      test.ok(found404Page, "should have found 404 page");
      test.done();
    });
  };

  function runServer(callback) {
    child = child_process.spawn("node", ["src/server/weewikipaint", "8080"]);
    child.stdout.setEncoding("utf8");

    child.stdout.on("data", function(chunk) {
      if (chunk.trim() === "Server started") callback();
    });
  }

  function httpGet(url, callback) {
    var request = http.get(url);
  
    request.on("response", function(response) {
      var receivedData = "";
      response.setEncoding("utf8");
  
      response.on("data", function(chunk) {
        receivedData += chunk;
      });
  
      response.on("end", function() {
        callback(response, receivedData);
      });
    });
  }

})();
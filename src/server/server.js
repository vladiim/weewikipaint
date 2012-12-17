(function() {

  "use strict";

  var http = require("http");
  var fs   = require("fs");
  var server;

  exports.start = function(homePageToServe, four04PageToServe, portNumber, callback) {
    if (!homePageToServe) throw("requires homepage to serve");
    if (!four04PageToServe) throw("requires 404 file to serve");
    if (!portNumber) throw("requires port number");

    server = http.createServer();

    server.on("request", function(request, response) {
      if (request.url === "/" || request.url === "/index.html") {
        response.statusCode = 200;
        serveFile(homePageToServe, response);
      } else {
        response.statusCode = 404;
        serveFile(four04PageToServe, response);
      }
    });

    server.listen(portNumber, callback);
  };

  exports.stop = function(callback) {
    server.close(callback);
  };

  function serveFile(file, response) {
    fs.readFile(file, function (err, data) {
      if (err) throw err;
      response.end(data);
    });
  }

}());
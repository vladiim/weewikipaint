// This spike demos serving up a file

"use strict";

var http   = require("http");
var fs     = require("fs");
var server = http.createServer();

server.on("request", function(request, response) {
  console.log("recieved request");

  fs.readFile("file.html", function(err, data) {
    if (err) throw err;
    response.end(data);
  });
});

server.listen(8080);

console.log("Server started");
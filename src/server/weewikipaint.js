(function() {
  "use strict";

  var server = require("./server");
  server.start("homepage.html", "404.html", 8080);
  console.log("Server started");
}());
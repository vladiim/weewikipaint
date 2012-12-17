(function() {
  "use strict";

  var server = require("./server");
  server.start("src/server/content/homepage.html", "404.html", 8080, function() {
    console.log("Server started");
  });
}());
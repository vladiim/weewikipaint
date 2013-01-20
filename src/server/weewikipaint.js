(function() {
  "use strict";

  var server     = require("./server");
  var port       = process.argv[2];
  var home_page  = "src/server/content/homepage.html";
  var fail_page = "src/server/content/404.html";

  server.start(home_page, fail_page, port, function() {
    console.log("Server started");
  });
}());
(function() {
  "use strict";

  var DIR        = "src/server/content/";

  var server     = require("./server");
  var port       = process.argv[2];
  var home_page  = DIR + "homepage.html";
  var fail_page  = DIR + "404.html";

  server.start(home_page, fail_page, port, function() {
    console.log("Server started on port: " + port);
  });
}());
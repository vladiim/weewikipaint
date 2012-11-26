/*global desc, task, jake, fail, complete */
(function() {
  "use strict";

  desc("Build and test");
  task("default", ["lint"]);

  desc("Lint everything");
  task("lint", [], function() {
    var lint = require("./build/lint/lint_runner.js");

    var files = new jake.FileList();
    files.include("**/*.js");
    files.exclude("node_modules");

    lint.validateFileList(files.toArray(), nodeLintOptions(), {});
  });

  desc("Integrate");
  task("integrate", ["default"], function() {
    colsole.log("1. Make sure 'git status' is clean.");
    console.log("2. Build on the integrateion box.");
    colsole.log("   a. Walk over to ingration box.");
    colsole.log("   b. 'git pull'.");
    colsole.log("   c. 'jake'.");
    colsole.log("3. 'git checkout integration'.");
    colsole.log("4. 'git merge master --no-ff --log'.");
    console.log("5. 'git checkout master'.");
  });

  function nodeLintOptions() {
    return {
      bitwise: true,
      curly: false,
      eqeqeq: true,
      forin: true,
      immed: true,
      latedef: true,
      newcap: true,
      noarg: true,
      noempty: true,
      nonew: true,
      regexp: true,
      undef: true,
      strict: true,
      trailing: true,
      node: true
    };
  }
})();
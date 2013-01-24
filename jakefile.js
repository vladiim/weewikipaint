/*global desc, task, jake, fail, complete, directory */
(function() {
  "use strict";

  var NODE_VERSION       = "v0.8.14";
  var GENERATED_DIR      = "generated";
  var TEMP_TEST_FILE_DIR = GENERATED_DIR + "/test";

  directory(TEMP_TEST_FILE_DIR);

  desc("Build and test");
  task("default", ["lint", "test"]);

  desc("Delete generated files");
  task("cleanDir", [], function() {
    jake.rmRf(GENERATED_DIR);
  });

  desc("Lint everything");
  task("lint", ["nodeVersion"], function() {
    var lint = require("./build/lint/lint_runner.js");

    var files = new jake.FileList();
    files.include("**/*.js");
    files.exclude("node_modules");

    var passed = lint.validateFileList(files.toArray(), nodeLintOptions(), {});
    if (!passed) fail("Lint failed");
  });

  desc("Test everything");
  task("test", ["nodeVersion", TEMP_TEST_FILE_DIR], function() {
    var files = new jake.FileList();
    files.include("**/_*_test.js");
    files.exclude("node_modules");
    files.exclude("src/server/_release_test.js");

    var reporter = require("nodeunit").reporters["default"];
    reporter.run(files.toArray(), null, function(failures) {
      if (failures) fail("Tests failed");
      complete();
    });
  }, {async: true});

  desc("Deploy to Heroku");
  task("deploy", ["default"], function() {
    console.log("1. Make sure 'git status' is clean.");
    console.log("2. 'git push heroku master'");
    console.log("3. 'jake test'");
  });

  desc("Integrate");
  task("integrate", ["default"], function() {
    console.log("1. Make sure 'git status' is clean.");
    console.log("2. Build on the integrateion box.");
    console.log("   a. Walk over to ingration box.");
    console.log("   b. 'git pull'.");
    console.log("   c. 'jake'.");
    console.log("   d. If jake fails, stop! Try again after fixing issue.");
    console.log("3. 'git checkout integration'.");
    console.log("4. 'git merge master --no-ff --log'.");
    console.log("5. 'git checkout master'.");
  });

  // desc("Ensure correct version of Node is present");
  task("nodeVersion", [], function() {
    // check the node version is v0.8.14 or higher

    function failWithQualifier(qualifier) {
      fail("Incorrect node version. Expected" + qualifier +
           " [" + expectedString + "], but was [" + actualString + "]");
    }

    var expectedString = NODE_VERSION;
    var actualString   = process.version;
    var expected       = parseNodeVersion("expected Node version", expectedString);
    var actual         = parseNodeVersion("Node version", actualString);

    if (process.env.strict) {
      if (actual[0] !== expected[0] || actual[1] !== expected[1] || actual[2] !== expected[2]) {
        failWithQualifier(" exactly");
      }
    } else {
      if (actual[0] < expected[0]) failWithQualifier(" at least");
      if (actual[0] === expected[0] && actual[1] < expected[1]) failWithQualifier(" at least");
      if (actual[0] === expected[0] && actual[1] === expected[1] && actual[2] < expected[2]) failWithQualifier(" at least");
    }
  });

  function parseNodeVersion(description, versionString) {
    var versionMatcher = /^v(\d+)\.(\d+)\.(\d+)$/;  // v[major].[minor].[bugfix]
    var versionInfo    = versionString.match(versionMatcher);
    if (versionInfo === null) fail("Count not parse " + description + " (was '" + versionString + "')");

    var major  = parseInt(versionInfo[1], 10);
    var minor  = parseInt(versionInfo[2], 10);
    var bugfix = parseInt(versionInfo[3], 10);
    return [major, minor, bugfix];
  }

  function sh(command, callback) {
    console.log("> " + command);
    var stdout = "";
    var process = jake.createExec(command, { printStdout: true, printSterr: true });

    process.on("stdout", function(chunk) {
      stdout += chunk;
    });

    process.on("cmdEnd", function() {
      console.log();
      callback(stdout);
    });

    process.run();
  }

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
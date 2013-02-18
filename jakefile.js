/*global desc, task, jake, fail, complete, directory */
(function() {
  "use strict";

  var NODE_VERSION       = "v0.8.14";
  var GENERATED_DIR      = "generated";
  var TEMP_TEST_FILE_DIR = GENERATED_DIR + "/test";
  var SUPPORTED_BROWSERS = ['Chrome 24.0', 'Safari 6.0'];

  var lint     = require("./build/lint/lint_runner.js");
  var nodeUnit = require("nodeunit").reporters["default"];

  directory(TEMP_TEST_FILE_DIR);

  desc("Build and test");
  task("default", ["lint", "test"]);

  desc("Start Testacular server for testing");
  task("testacular", function() {
    sh("node node_modules/.bin/testacular start build/testacular.conf.js", "Could not start testacular", complete);
  }, {async: true});

  desc("Delete generated files");
  task("cleanDir", [], function() {
    jake.rmRf(GENERATED_DIR);
  });

  desc("Lint everything");
  task("lint", ["lintNode", "lintClient"]);

  desc("Lint node");
  task("lintNode", ["nodeVersion"], function() {
    var passed = lint.validateFileList(nodeFiles(), nodeLintOptions(), {});
    if (!passed) fail("Lint failed");
  });

  desc("Lint client");
  task("lintClient", function() {
    var passed = lint.validateFileList(clientFiles(), browserLintOptions(), {});
    if (!passed) fail("Lint failed");
  });

  desc("Test everything");
  task("test", ["testNode", "testClient"]);

  desc("Test server code");
  task("testNode", ["nodeVersion", TEMP_TEST_FILE_DIR], function() {
    nodeUnit.run(nodeTestFiles(), null, function(failures) {
      if (failures) fail("Tests failed");
      complete();
    });
  }, {async: true});

  desc("Test client code");
  task("testClient", function() {
    var config = {};
    var output = "";

    var oldStdoutWrite = process.stdout.write;

    process.stdout.write = function(data) {
      output += data;
      oldStdoutWrite.apply(this, arguments);
    };

    require("testacular/lib/runner").run(config, function(exitCode) {
      process.stdout.write = oldStdoutWrite;

      if (exitCode) fail("Client tests failed (to start server, run `jake testacular`");

      var browserMissing = false;
      SUPPORTED_BROWSERS.forEach(function(browser) {
        browserMissing = checkIfBrowserTested(browser, output) || browserMissing;
      });

      if (browserMissing && !process.env.loose) fail("Did not test all supported browsers (user `loose=true` to run anyway");
        if (output.indexOf("TOTAL 0 SUCCESS") !== -1) fail("Client tests did not run!");
    });
  }, {async: true});

  function checkIfBrowserTested(browser, output) {
    var missing = output.indexOf(browser + ": Executed") === -1;
    if (missing) console.log(browser + " was not tested!");
    return missing;
  }

  function assertBrowserIsTested(browser_name, output) {
    var search_string = browser_name + ': Executed';
    var found = output.indexOf(search_string) !== -1;
    if (found) console.log('Confirmed: ' + browser_name + ' tested');
    else fail(browser_name + ' was not tested!');
  }

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

  function sh(command, errorMessage, callback) {
    console.log("> " + command);
    var stdout = "";
    var process = jake.createExec(command, { printStdout: true, printSterr: true });

    process.on("stdout", function(chunk) {
      stdout += chunk;
    });

    process.on("error", function(chunk) {
      fail(errorMessage);
    });

    process.on("cmdEnd", function() {
      console.log();
      callback(stdout);
    });

    process.run();
  }

  function globalLintOptions() {
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
      trailing: true
    };
  }

  function nodeLintOptions() {
    var options  = globalLintOptions();
    options.node = true;
    return options;
  }


  function browserLintOptions() {
    var options     = globalLintOptions();
    options.browser = true;
    return options;
  }

  function nodeFiles() {
    var node_files = new jake.FileList();
    node_files.include("**/*.js");
    node_files.exclude("node_modules");
    node_files.exclude("testacular.conf.js");
    node_files.exclude("src/client");
    node_files = node_files.toArray();
    return node_files;
  }

  function nodeTestFiles() {
    var test_files = new jake.FileList();
    test_files.include('**/_*_test.js');
    test_files.exclude('node_modules');
    test_files.exclude('src/client/**');
    test_files = test_files.toArray();
    return test_files;
  }

  function clientFiles() {
    var javascriptFiles = new jake.FileList();
    javascriptFiles.include("src/client/**/*.js");
    var client_files = javascriptFiles.toArray();
    return client_files;
  }
})();
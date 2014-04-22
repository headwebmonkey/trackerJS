global.databaseHost = "localhost";
global.databasePort = 27017;
global.databaseName = "trackerJS";

var db = require("./modules/utils/db.js");
db.init().then(function(){
  global.tracker = require("./modules/tracker/index.js");
  tracker.init("localhost", 3000);

  global.webUI = require("./modules/web-ui/index.js");
  webUI.init(3001);
});
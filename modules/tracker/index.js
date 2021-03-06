var journey = require("journey"),
    router = new(journey.Router),
    utils = require("../utils/"),
    fs = require('fs'),
    path = require('path'),
    minify= require("minify"),
    serverURL = "",
    onlineUsers = {};

function _init(serverAddress, port){
  serverURL = serverAddress+":"+port;
  fs.exists(minify.MinFolder, function(file){
    if (file === false) return;
    fs.readdirSync(minify.MinFolder).forEach(function(fileName) {
      fs.unlinkSync(minify.MinFolder+fileName);
    });
  });

  router.map(function () {
    this.root.bind(routes.root);
    this.get("newClient").bind(routes.newClient);
    this.get("visit").bind(routes.visit);
    this.get("action").bind(routes.action);
  });

  require('http').createServer(function (request, response) {
    _preHandler(request, response);
    var body = "";
    request.addListener('data', function (chunk) { body += chunk });
    request.addListener('end', function () {
      console.log(request.url);
      if(request.url.indexOf("/static/") === -1 || request.url.indexOf("~/static/test.htm") !== -1){
        router.handle(request, body, function (result) {
          _postHandler(request, result);
          response.writeHead(result.status, result.headers);
          response.end(result.body);
        });
      }
    });
  }).listen(port);
}

function _errorHandler(res, code, message){
  res.send(code, {}, {
    error: message
  });
}

function _preHandler(req, res){
  req.startTime = process.hrtime();
  if(req.url.indexOf("/static/") !== -1 && req.url.indexOf("~/static/test.htm") === -1){
    var contentType = "text/plain";
    var filePath = __dirname+req.url;
    var shouldMinify = false;
    if(filePath.indexOf(".min") !== -1){
      shouldMinify = true;
      filePath = filePath.replace(".min", "");
    }
    fs.exists(filePath, function(file){
      if (file === false) {
        res.setHeader('Content-Type', contentType);
        res.writeHead(400);
        res.end('The file requested does not exist', 'utf8');
        return;
      }
      var stream = fs.createReadStream(filePath);
      stream.on('error', function(error) {
        res.writeHead(500);
        res.end();
        return;
      });
 
      var mimeTypes = {
        '.js' : 'text/javascript',
        '.css' : 'text/css',
        '.gif' : 'image/gif'
      };
 
      contentType = mimeTypes[path.extname(filePath)];
 
      res.setHeader('Content-Type', contentType);
      res.writeHead(200);
      if(filePath.indexOf("/static/tracker.js") === -1){
        stream.pipe(res);
      }else{
        var templates = {
          "TRACKER_SERVER_URL": serverURL
        };
        var hashName = minify.getName(filePath);
        fs.exists(hashName, function(file){
          var getFile = function(){
            var fileContents = fs.readFileSync(hashName).toString();
            for(var i in templates){
              var reg = new RegExp("%{"+i+"}", "g");
              fileContents = fileContents.replace(reg, templates[i]);
            }
            res.end(fileContents);
          };

          if (file === false && shouldMinify) {
            minify.optimize(filePath, {
              callback: getFile
            });
            return;
          }
          if(!shouldMinify){
            hashName = filePath;
          }
          getFile();
        });
      }
    });
  }
}

function _postHandler(req, result){
  var body = JSON.parse(result.body);
  body.statusCode = result.status;
  var memUsage = process.memoryUsage();
  var response = {
    result: body,
    debug: {
      processTimeSeconds: utils.hrdiff(req.startTime, process.hrtime()) / 1000000000,
      memoryUsageMB: {
        rss: memUsage.rss / 1048576,
        heapTotal: memUsage.heapTotal / 1048576,
        heapUsed: memUsage.heapUsed / 1048576,
      },
      platform: process.platform,
      architecture: process.arch,
      pid: process.pid,
      nodeVersion: process.version
    }
  };
  result.body = JSON.stringify(response);
  result.headers["Content-Length"] = Buffer.byteLength(result.body, 'utf8');
}

var routes = {
  root: function(req, res){
    res.send({
      version: "Analytics Tracker 0.0.1"
    });
  },
  newClient: function(req, res, params){
    res.send({});
    var browserInfo = params.d.split("~");
    var clientInfo = {
      clientId: params.c,
      firstVisit: utils.epoch(),
      browser: browserInfo[0],
      browserVersion: browserInfo[1],
      cookieSupport: browserInfo[2],
      language: browserInfo[3],
      screenSize: browserInfo[4],
      operatingSystem: browserInfo[5],
      operatingSystemVersion: browserInfo[6],
      mobileDevice: browserInfo[7]
    };
    db.collection("clients").insert(clientInfo, function(){});
  },
  visit: function(req, res, params){
    res.send({});
    var visitInfo = params.d.split("~");
    var clientInfo = {
      clientId: params.c,
      visitId: params.v,
      time: utils.epoch(),
      protocol: visitInfo[0],
      host: visitInfo[1],
      path: visitInfo[2],
      referrer: visitInfo[3]
    };
    db.collection("visits").insert(clientInfo, function(){});
    if(onlineUsers[params.c] == undefined){
      onlineUsers[params.c] = {
        lastSeen: utils.epoch()
      }
    }
    onlineUsers[params.c].lastSeen = utils.epoch();
  },
  action: function(req, res, params){
    res.send({});
    var actionInfo = params.d.split("~");
    var info = JSON.parse(actionInfo[1]);
    info.clientId = params.c;
    info.visitId = params.v;
    info.time = utils.epoch();
    info.action = actionInfo[0];
    db.collection("actions").insert(info, function(){});
  }
};

module.exports = {
  init: _init,
  onlineUsers: onlineUsers
};
function _init(port){
  var express = require('express');
  var app = express();
  app.use('/static', express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.get('/', function(req, res){res.render('index');});

  app.listen(port);
}

module.exports = {
  init: _init
};
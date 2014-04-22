var q = require('q');
var mongo = require('mongodb');
global.BSON = require('mongodb').BSONPure;
var Server = mongo.Server;
var Db = mongo.Db;
var self = null;

var server = new Server(databaseHost, databasePort, {auto_reconnect: true});
global.db = new Db(databaseName, server, {safe:true});

module.exports = {
  init: function(){
    self = this;
    console.log("Connecting to Database");
    var deferred = q.defer();
    db.open(function(err, db) {
      if(err){
        console.log("OpenError: "+error);
      }else{
        self.validateCollections(deferred, db);
        // db.authenticate("gtaBlackBook", "FMUH4CNF", function(err2,data2){
        //   if(data2){
        //     self.validateCollections(deferred, db);
        //   }else{
        //     console.log("AuthError: "+err2);
        //   }
        // });
      }
    });
    return deferred.promise;
  },
  validateCollections: function(deferred, db){
    db.collection('clients', {strict:true}, self.handleCollection);
    db.collection('visits', {strict:true}, self.handleCollection);
    db.collection('actions', {strict:true}, self.handleCollection);
    deferred.resolve("");
    console.log("Connected");
  },
  handleCollection: function(err, collection){
    if (err) {
      err = err.toString();
      if (err.indexOf("does not exist") != -1){
        collection = err.split("Collection ")[1].split(" does not")[0];
        console.log("The '"+collection+"' collection doesn't exist. Creating it...");
        self.populateDB(collection);
      }else{
        console.log(err);
      }
    }else{
      self.ensureIndex(collection.collectionName);
    }
  },
  populateDB: function(collection){
    var to_insert = [];
    db.collection(collection, function(err, collection) {
      self.ensureIndex(collection.collectionName);
    });
  },
  indexError: function(err, index){
    if(err){
      console.log(err);
    }
  },
  ensureIndex: function(collection){
    switch(collection){
      case 'clients':
        db.ensureIndex(collection, {clientID:1}, {} , self.indexError);
        break;
      case 'visits':
        db.ensureIndex(collection, {path:1, clientID:1, visitID:1}, {} , self.indexError);
        break;
      case 'actions':
        db.ensureIndex(collection, {action:1, clientID:1, visitID:1}, {} , self.indexError);
        break;
    }
  }
}

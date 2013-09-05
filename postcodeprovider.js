var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

PostCodeProvider = function(host) {
  this.db= new Db('geolocations', new Server(host, {safe: true}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

PostCodeProvider.prototype.getCollection = function(callback) {
  this.db.collection('Postcodelookup', function(error, employee_collection) {
    if( error ) callback(error);
    else callback(null, employee_collection);
  });
};

PostCodeProvider.prototype.findAll = function(input, callback) {
    this.getCollection(function(error, employee_collection) {
      if( error ) callback(error)
      else {
        employee_collection.find({$or : [{ postRegon:input },{postcode:input},{postcoderegon:input}]}).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};
exports.PostCodeProvider = PostCodeProvider;

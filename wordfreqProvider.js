var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

WordProvider = function(host, port) {
  this.db= new Db('hadoopOuput', new Server(host, port, {safe: true}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

WordProvider.prototype.getCollection = function(callback) {
  this.db.collection('wordFreqv1', function(error, employee_collection) {
    if( error ) callback(error);
    else callback(null, employee_collection);
  });
};

WordProvider.prototype.findAll = function(postcode, callback) {
	console.log(postcode)
    this.getCollection(function(error, employee_collection) {
      if( error ) callback(error)
      else {
        employee_collection.find({location : postcode, type:"daily"}).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

exports.WordProvider = WordProvider;

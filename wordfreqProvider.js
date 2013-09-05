var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

WordProvider = function(host, port) {
  this.db= new Db('geolocations', new Server("ds027668.mongolab.com", 27668, {auto_reconnect: true}, {}));
  //this.db =  MongoClient.connect("mongodb://danjamker:apple@ds027668.mongolab.com:27668/geolocations", { server: { auto_reconnect: true } })
  this.db.open(function(err, db){
    db.authenticate('danjamker', 'apple', function(err, result) {
      console.log(err)
    });
  });

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

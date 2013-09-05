var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

DataProvider = function(host, port) {
  //this.db= new Db('hadoopOuput', new Server(host, port, {safe: true}, {auto_reconnect: true}, {}));
  //this.db.open(function(){});
  this.db= new Db('geolocations', new Server("ds027668.mongolab.com", 27668, {auto_reconnect: true}, {}));
  //this.db =  MongoClient.connect("mongodb://danjamker:apple@ds027668.mongolab.com:27668/geolocations", { server: { auto_reconnect: true } })
  this.db.open(function(err, db){
    db.authenticate('danjamker', 'apple', function(err, result) {
      console.log(err)
    });
  });
};

DataProvider.prototype.getCollection = function(callback) {
  this.db.collection('GraphData', function(error, employee_collection) {
    if( error ) callback(error);
    else callback(null, employee_collection);
  });
};

DataProvider.prototype.findAll = function(postcode, callback) {
	console.log(postcode)
    this.getCollection(function(error, employee_collection) {
      if( error ) callback(error)
      else {
        employee_collection.find({location : postcode}).toArray(function(error, results) {
          if( error ){
            console.log(results)
            console.log(error)
           callback(error)
         }
          else callback(null, results)
        });
      }
    });
};

exports.DataProvider = DataProvider;

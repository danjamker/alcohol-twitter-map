
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongo = require('mongodb');
  
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



var mongoUri =  mongodb://danjamker:apple@ds027668.mongolab.com:27668/geolocations

mongo.Db.connect(mongoUri, function (err, db) {
 db.collection('UKPostcode').find({ loc :
                  { $geoWithin :
                    { $geometry :
                      { type : "Polygon" ,
                        coordinates : [ [
                                          [ 0 , 0 ] ,
                                          [ 3 , 6 ] ,
                                          [ 6 , 1 ] ,
                                          [ 0 , 0 ]
                                        ] ]
                } } } });
});

app.get('/', routes.index);

app.get('/geoJSON/:x/:y/:e/:w/:q.json', function (req, res) {
    
    mongo.Db.connect(mongoUri, function (err, db) {
        var tmp = [[req.params.y,req.params.e],[req.params.w,req.params.q]]
      db.collection('places').find({loc: {$within: {$box: tmp}}).toArray(function(err, docs) {
        if(err) return console.dir(err)
    
        assert.equal(docs.length, 2);
      });
      
});
    
    res.sendfile("./GeoJSON/National.json");
})

app.get('/National.json', function (req, res) {
    res.sendfile("./GeoJSON/National.json");
})
app.get('/Regional.json', function (req, res) {
    res.sendfile("./GeoJSON/Regional.json");
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

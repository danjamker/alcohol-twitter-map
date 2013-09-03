
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

  var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON;

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




app.get('/', routes.index);

app.get('/geoJSON/:x/:y/:e/:w/:q.json', function (req, res) {
    
    query = {
    "loc": {
        "$geoWithin": {
            "$geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            req.params.e,req.params.y
                        ],
                        [
                            req.params.e,req.params.w
                        ],
                        [
                           req.params.q,req.params.w
                        ],
                        [
                            req.params.q,req.params.y
                        ],                        
                        [
                            req.params.e,req.params.y
                        ]
                    ]
                ]
            }
        }
    }
};
      var uri =   "mongodb://danjamker:apple@ds027668.mongolab.com:27668/geolocations";
      MongoClient.connect(uri, { server: { auto_reconnect: true } }, function (err, db) {
          console.log(err)
          db.collection('UKPostcode').find({
              loc: {
                  $geoWithin: {
                      $geometry: {
                          type: "Polygon",
                          coordinates: [
                              [
                                  [
                                      parseFloat(req.params.e),parseFloat(req.params.y)
                                  ],
                                  [
                                      parseFloat(req.params.e),parseFloat(req.params.w)
                                  ],
                                  [
                                     parseFloat(req.params.q),parseFloat(req.params.w)
                                  ],
                                  [
                                      parseFloat(req.params.q),parseFloat(req.params.y)
                                  ],                        
                                  [
                                      parseFloat(req.params.e),parseFloat(req.params.y)
                                  ]
                              ]
                          ]
                      }
                  }
              }
          }).toArray(function(err, docs) {

                lols = []
                for (var i = 0; i < docs.length; i++) {
                  tmp = {"type":"Feature",
                          "geometry":{"type":"Polygon",
                            "coordinates":docs[i].loc.coordinates},
                            "properties":{"id":docs[i].id}
                          }
                          lols.push(tmp)

                  console.log(docs[i].id);
    //Do something
                }
                tmp = { "type": "FeatureCollection",
                        "features":lols
                      }
                res.json(tmp);
              });  
            });
     
    //res.sendfile("./GeoJSON/National.json");
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

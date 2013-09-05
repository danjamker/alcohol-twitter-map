
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , moment = require('moment');


  var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    DataProvider = require('./dataprovider').DataProvider,
    WordProvider = require('./wordfreqProvider').WordProvider,
    PostCodeProvider = require('./postcodeProvider').PostCodeProvider;


var sort = function (list) {
 
    var comparisons = 0,
        swaps = 0,
        endIndex = 0,
        len = list.length - 1,
        hasSwap = true;
 
    for (var i = 0; i < len; i++) {
 
        hasSwap = false;
 
        for (var j = 0, swapping, endIndex = len - i; j < endIndex; j++) {
            comparisons++;

            if (moment(list[j][0]).isAfter(list[j + 1][0])) {
         
                swapping = list[j];
 
                list[j] = list[j + 1];
                list[j + 1] = swapping;
 
                swaps++;
                hasSwap = true;
            };
        };
 
        if (!hasSwap) {
            break;
        }
    }
 
    console.log("--Bubble Sort--")
    console.log("Comparisons: " + comparisons);
    console.log("Swaps: " + swaps);
                 
    return list;
};

var sortd = function (list) {
 
    var comparisons = 0,
        swaps = 0,
        endIndex = 0,
        len = list.length - 1,
        hasSwap = true;
 
    for (var i = 0; i < len; i++) {
 
        hasSwap = false;
 
        for (var j = 0, swapping, endIndex = len - i; j < endIndex; j++) {
            comparisons++;

            if (moment(list[j]["time"]).isAfter(list[j + 1]["time"])) {
         
                swapping = list[j];
 
                list[j] = list[j + 1];
                list[j + 1] = swapping;
 
                swaps++;
                hasSwap = true;
            };
        };
 
        if (!hasSwap) {
            break;
        }
    }
 
    console.log("--Bubble Sort--")
    console.log("Comparisons: " + comparisons);
    console.log("Swaps: " + swaps);
                 
    return list;
};

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
var dataProvider = new DataProvider('localhost', 27017);
var wordProvider = new WordProvider('localhost', 27017);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




app.get('/', function (req, res){
 res.render('index', {
              menu:"index"
          });
});

app.get('/about', function (req, res){
 res.render('about', {
              menu:"about"
          });
});


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

app.get('/:postcode', function (req, res) {
  var postcodeProvider = new PostCodeProvider('mongodb://danjamker:apple@ds027668.mongolab.com:27668');

  dataProvider.findAll(req.params.postcode.replace(/\s+/g, '-'), function(error, emps){

        data = []
        scores = []

        for (var i = 0; i < emps.length; i++) {
          element = emps[i];
          if(element.type == "daily"){
            data.push([element.time,element.score])
          }
        }

          list = sort(data)

          tmp = []
          for(var i = 0; i < list.length; i++){
            tmp.push(moment(list[i][0]).format('dddd'))
            scores.push(list[i][1])
          }
          // Do something with element i.
        
        wordProvider.findAll(req.params.postcode.replace(/\s+/g, '-'), function(errors, word){
              
              tfvodka = []
              tfdrunk = []
              tfhungover = []
              tfhangover = []
              tfwasted = []
              tfpissed = []
              tfwine = []

              tpvodka = []
              tpdrunk = []
              tphungover = []
              tphangover = []
              tpwasted = []
              tppissed = []
              tpwine = []

              tweetCount = []

              list = sortd(word)

              for(var i = 0; i < list.length; i++){
                tfvodka.push(list[i]["termfreq"]["vodka"])
                tfdrunk.push(list[i]["termfreq"]["drunk"])
                tfhungover.push( list[i]["termfreq"]["hungover"])
                tfhangover.push(list[i]["termfreq"]["hangover"])
                tfwasted.push(list[i]["termfreq"]["wasted"])
                tfpissed.push(list[i]["termfreq"]["pissed"])
                tfwine.push(list[i]["termfreq"]["wine"])

                tpvodka.push(list[i]["termprob"]["vodka"])
                tpdrunk.push(list[i]["termprob"]["drunk"])
                tphungover.push(list[i]["termprob"]["hungover"])
                tphangover.push(list[i]["termprob"]["hangover"])
                tpwasted.push(list[i]["termprob"]["wasted"])
                tppissed.push(list[i]["termprob"]["pissed"])
                tpwine.push(list[i]["termprob"]["wine"])

                tweetCount.push(list[i]["tweetCount"])
              }

              var postcode = "";
              var postcodeRegon = "";
              var regon = "";
             

              var uri =   "mongodb://danjamker:apple@ds027668.mongolab.com:27668/geolocations";
      MongoClient.connect(uri, { server: { auto_reconnect: true } }, function (err, db) {
          db.collection('Postcodelookup').find({
            $or : 
            [{ postRegon:req.params.postcode },{postcode:req.params.postcode},{postcoderegon:req.params.postcode}]
          }).toArray(function(err, docs){

              vara = ""
              varb = ""
              varc = ""

              varx = false
              vary = false
              varz = false
              for(var j = 0; j < docs.length ; j++){
                console.log(docs[j])
                if(req.params.postcode == docs[j]["postRegon"]){
                  varx = true
                }
                if(req.params.postcode == docs[j]["postcode"]){
                  vary = true
                }                
                if(req.params.postcode == docs[j]["postcoderegon"]){
                  varz = true
                }
                vara = docs[j]["postRegon"]
                varb = docs[j]["postcode"]
                varc = docs[j]["postcoderegon"]

              }

              res.render('postcode', {
              title: req.params.postcode,
              days: JSON.stringify(tmp),
              scores: scores,
              menu:"postcode",
              tfvodka:tfvodka,
              tfdrunk :tfdrunk,
              tfhungover: tfhungover,
              tfhangover:tfhangover,
              tfwasted :tfwasted,
              tfpissed :tfpissed,
              tfwine :tfwine,

              tpvodka:tpvodka,
              tpdrunk :tpdrunk,
              tphungover: tphungover,
              tphangover :tphangover,
              tpwasted :tpwasted,
              tppissed :tppissed,
              tpwine :tpwine,
              tweetCount:tweetCount,
              vara:vara,
              varb:varb,
              varc:varc,
              varx:varx,
              vary:vary,
              varz:varz 


              })
          })});
              










        });
    });
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

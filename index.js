var http = require('http');
var express = require('express');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Server = require('mongodb').Server;
var CollectionDriver = require('./collectionDriver.js').CollectionDriver;

var app = express();
app.set('port', process.env.PORT || 3000);
var collectionDriver;
 
MongoClient.connect('mongodb://localhost:27017/rerum', function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  collectionDriver = new CollectionDriver(db);
  db.close();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:collection', function(req, res) {
   var params = req.params;
   collectionDriver.findAll(req.params.collection, function(error, objs) {
    	  if (error) { res.send(400, error); }
	      else { 
	          if (req.accepts('html')) {
    	          res.render('data',{objects: objs, collection: req.params.collection});
              } else {
	          res.set('Content-Type','application/json');
                  res.send(200, objs);
              }
         }
   	});
});
 
app.get('/:collection/:entity', function(req, res) {
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
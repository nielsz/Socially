var searchterm = process.argv[2];
console.log(searchterm);

var EMBEDLY_KEY = 'EMBEDLY_KEY';

var embedly = require('embedly')
  , require_either = embedly.utils.require_either
  , util = require_either('util', 'utils')
  , Api = embedly.Api
  , api = new Api({user_agent: 'Mozilla/5.0 (compatible; myapp/1.0; u@my.com)', key: EMBEDLY_KEY});


var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: 'consumer_key',
  consumer_secret: 'consumer_secret',
  access_token_key: 'access_token_key',
  access_token_secret: 'access_token_secret'
});

twit.stream('statuses/filter', {'track':searchterm}, function(stream) {
  stream.on('data', function (data) {
    if(data.retweeted_status == null) {
      io.sockets.emit('tweet', { 'user': data.user.name, 'text': data.text, 'created_at': data.created_at  } );

      var urls = data.entities.urls.map(function(x){return x.url});
      
      if (urls.length > 0) {
        api.oembed(
          { urls: urls
          , wmode: 'transparent'
          , method: 'after'
          }
        ).on('complete', function(objs) {
          for (var i in objs) {
            if(objs[i].thumbnail_url != null) {
              io.sockets.emit('media', { 'thumbnail_url': objs[i].thumbnail_url } );
            }
          }
        }).on('error', function(e) {
          console.error(e);
        }).start();
      }

    }
  });
});

var fsqconfig = {
  "secrets" : {
    "clientId" : "clientId",
    "clientSecret" : "clientSecret",
    "redirectUrl" : "redirectUrl"
  }
}

var foursquare = require("node-foursquare")(fsqconfig);

var express = require("express");

var app = express.createServer()
  ,io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
  twit.search(searchterm, {'include_entities':true}, function(err, data) {
    for(var i in data.results) {
      socket.emit('tweet', { 'user': data.results[i].from_user, 'text': data.results[i].text, 'created_at': data.results[i].created_at } );
    }
  });
});

io.configure(function(){
  io.set('log level', 1);                    // reduce logging
});

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/login', function(req, res) {
  res.writeHead(303, { "location": foursquare.getAuthClientRedirectUrl() });
  res.end();
});

app.get('/callback', function (req, res) {
  foursquare.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if(error) {
      res.send("An error was thrown: " + error.message);
    }
    else {
      foursquare.Tips.search(
        51.6849402, 5.3027184,
        null,
        accessToken,
        function (error, results) {
          console.log(error);
          console.dir(results);
        });
      res.end('You have succesfully authorized Socially.');
    }
  });
});

app.listen(1337);

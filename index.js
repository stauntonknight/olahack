var express = require('express');
var app = express();
var path = require("path");
var stylus = require('stylus')
var nib = require('nib');
var queryParser = require('./engines/parsequery.js');
var morgan = require('morgan');
var winston = require('winston');
var mongo = require('./data/mongodb');
var olaengine = require('./engines/olaengine.js');
var scheduler = require('./engines/scheduler.js');

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, '/scripts')));
app.set('view engine', 'jade');
app.use(morgan('combined'));

app.use(stylus.middleware({
   	src: __dirname + '/stylesheets',
	compile: compile
}));

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/handlequery', function(req, res) {
    var query = req.query.q;
    queryParser.queryParser.parse(query).then(function(args) {
        console.log('query parsed' + args.length);
        var start = args[0], dest = args[1], hr = args[2], min = args[3];
        console.log(hr);
        console.log(min);
        // Save this data to mongodb.
        mongo.mongo.createTrip(
            start,
            dest,
            hr,
            min).then(function() {
                    res.end('success');
                }, function() {
                    res.end('fail');
                }).catch(function(err) {
                  console.log(err);
                  res.end('fail');
                }).done();
    }, function() {
        res.end('fail');
    });
});

app.get('/getrecentevents', function(req, res) {
    mongo.mongo.getAllTasks().then(function(result) {
        console.log('Recent all tasks.');
        res.end(JSON.stringify(result));
    }, function() {
        res.end('fail');
    });    
});

app.get('/saveoauth', function(req,res) {
    var h = req.query.q;
    var all = h.split('&');
    for (var i = 0; i < all.length; i++ ) {
        var me = all[i].split('=');
        if (me[0] == 'access_token') {
            olaengine.olaengine.header = me[1];
            console.log('Access : '+ me[1]);
        }
    }
    res.end('success');
});

app.get('/createchore', function(req,res) {
    mongo.mongo.createChore(
            req.query.title,
            req.query.link,
            req.query.duration).then(function() {
                    res.end('success');
                }, function() {
                    res.end('fail');
                }).catch(function(err) {
                  console.log(err);
                  res.end('fail');
                }).done();
});

app.get('/getChores', function(req,res) {
    mongo.mongo.getChores().then(function(result) {
                    res.end(JSON.stringify(result));
                }, function() {
                    res.end('fail');
                }).catch(function(err) {
                  console.log(err);
                  res.end('fail');
                }).done();
});

app.get('/getCurrentRideEstimate', function(req, res) {
    olaengine.olaengine.getRunningRideEstimate().then(function(result) {
        console.log("Ride estimate " + result);
        res.end(result + '');
    }, function() {
        res.end('fail');
    });
});

app.get('/deleteChore', function(req, res) {
    console.log('Deleting ' + req.query.title);
    mongo.mongo.deleteChore(req.query.title);
    res.send("success");
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
    scheduler.scheduler.scheduleAll();
	console.log('Example app listening at http://%s:%s', host, port);
});

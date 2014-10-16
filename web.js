var express = require("express"),
    bodyParser = require("body-parser"),
    logfmt = require("logfmt"),
    mongo = require('mongodb'),
    screens = require('./screens'),
    charts = require('./charts'),
    app = express(),
    mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/charts',
    unauthorizedPath = '/unauthorized';

var db;
var charts;


app.use(logfmt.requestLogger());
app.use(bodyParser.json());

app.use(function (req, res, next) {
    req.charts = db.collection('charts');
    req.unauthorized = unauthorizedPath;
    next();
});
app.use(function (err, req, res, next) {
    if (err != null) {
        //TODO: improve error handling
        console.error(err.stack);
        res.status(500).json(m().error("Something's not ok with your request. Error type: " + err.type).out());
    }
});


/**
 * OLD API
 */

/* Routes */
app.get('/', screens.home);
app.get('/bar', charts.bar);
app.get('/line', charts.line);
app.post('/line', charts.line);
/*
app.post('/line', function(req, res){
    charts.line;
});
*/

var port = Number(process.env.PORT || 5000);
app.listen(port, function () {
    console.log("Listening on " + port);
});


/*
mongo.Db.connect(mongoUri, function (err, database) {
    if (err) throw err;

    db = database;
    charts = db.collection('charts');

    var port = Number(process.env.PORT || 5000);
    app.listen(port, function () {
        console.log("Listening on " + port);
    });
});
*/

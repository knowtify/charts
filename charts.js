var phantom = require('phantom');
var phantomInstance;
var phPage;

var md5 = require('MD5');

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws.json');
//test
//var bucketName="knowtify-charts-andrea";
//var bucketPublicUrl="http://knowtify-charts-andrea.s3-website-us-east-1.amazonaws.com/";
var bucketName="knowtify-charts";
var bucketPublicUrl="http://knowtify-charts.s3-website-us-east-1.amazonaws.com/";


phantom.create(function (ph) {
    phantomInstance = ph;

    phantomInstance.createPage(function (page) {
        phPage=page;
        phPage.set('viewportSize', {width: 800, height: 200});
        console.log("phantom js ready to go");
    });
}, {
    dnodeOpts: {
        weak: false
    }
}); 

exports.d3 = function (req,res){
    var json = req.body;
    var filename = 'd3.png';
    var params = {};
    phPage.open("./d3/d3shell.html", function (status) {
        phPage.evaluate(function (params,cType) {
            phPage.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
              phPage.includeJS('https://s3.amazonaws.com/js.knowtify.io/js/demo/sunburst.js',function(){
                return document.querySelector("#chart").getBoundingClientRect();
              });
            });
        }, function (result) {
            phPage.renderBase64('PNG', function (pic) {
                var s3bucket = new AWS.S3({params: {Bucket: bucketName}});
                s3bucket.createBucket(function() {
                    var data = {ACL: 'public-read',ContentType:"image/png",Key: filename, Body: new Buffer(pic, 'base64')};
                    s3bucket.putObject(data, function(err, data) {
                        if (err) {
                            res.error("error producing image");
                            console.log("Error uploading data: ", err);
                        } else {
                            res.json({ chart_url: 'https://s3.amazonaws.com/knowtify-charts/d3.png' });
                            console.log("Successfully uploaded file d3.js");
                        }
                    });
                });


            });
        },params,phPage);

    });
}

exports.line = function (req, res) {
    var json = req.body;
    //var customData=[3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2];
    var lines = json.lines;
    var filename = json.filename;
    var width = (typeof json.width != 'undefined') ? json.width : 800;
    var height = (typeof json.height != 'undefined') ? json.height : 500;
    var show_y_axis = (typeof json.show_y_axis != 'undefined' && json.show_y_axis == true) ? true : false;
    var curved_lines = (typeof json.curved_lines != 'undefined' && json.curved_lines == true) ? true : false;
    var x_axis_labels = (typeof json.x_axis_labels != 'undefined') ? json.x_axis_labels : '';
    var margin_top = (typeof json.margin_top != 'undefined') ? json.margin_top : 80;
    var margin_right = (typeof json.margin_right != 'undefined') ? json.margin_right : 80;
    var margin_bottom = (typeof json.margin_bottom != 'undefined') ? json.margin_bottom : 80;
    var margin_left = (typeof json.margin_left != 'undefined') ? json.margin_left : 80;
    var y_axis_color = (typeof json.y_axis_color != 'undefined') ? json.y_axis_color : "#aaa";
    var x_axis_color = (typeof json.x_axis_color != 'undefined') ? json.x_axis_color : "#aaa";
    var background_color = (typeof json.background_color != 'undefined') ? json.background_color : "#fff";
    var chartType="line";
    var chart = {
        chartData:{
            width:width,
            height:height,
            curved_lines:curved_lines,
            show_y_axis:show_y_axis,
            x_axis_labels:x_axis_labels,
            margin_top:margin_top,
            margin_right:margin_right,
            margin_bottom:margin_bottom,
            margin_left:margin_left,
            y_axis_color:y_axis_color,
            x_axis_color:x_axis_color,
            background_color:background_color,
            lines:lines,
            type:chartType,
            filename:filename
        }
    };
    req.chart=chart;
    makeChart(req,res);
};

exports.bar = function (req, res) {
    var customData=[{"letter":"A","frequency":2},{"letter":"B","frequency":5}];

    var chartType="bar";
    var chart = {
        chartData:{
            data:customData,
            type:chartType
        }
    };
    req.chart=chart;
    knowtifyChart(req,res);

};

knowtifyChart = function (req, res) {
    if (req.chart!=null)
    {
        var chartHash=chartMD5(req.chart);
        req.charts.findOne({"hash":chartHash},function(err,chart){
           if (chart!=null)
           {
                //res.redirect(chart.url);
                res.json({ chartUrl: chart.url })
           }else
           {
               createChart(req,res,req.chart);
           }
        });
    }
    else{
        res.error("no chart");
    }
};

makeChart = function (req, res) {
    if (req.chart!=null)
        createChart(req,res,req.chart);
    else{
        res.error("no chart");
    }
};


createChart = function (req,res,chart) {
    var params = {
        lines:chart.chartData.lines,
        width:chart.chartData.width,
        height:chart.chartData.height,
        show_y_axis:chart.chartData.show_y_axis,
        x_axis_labels:chart.chartData.x_axis_labels,
        margin_top:chart.chartData.margin_top,
        margin_right:chart.chartData.margin_right,
        margin_bottom:chart.chartData.margin_bottom,
        margin_left:chart.chartData.margin_left,
        y_axis_color:chart.chartData.y_axis_color,
        x_axis_color:chart.chartData.x_axis_color,
        background_color:chart.chartData.background_color,
        curved_lines:chart.chartData.curved_lines,
        data:chart.chartData.data
    }
    var customData=chart.chartData.data;
    var chartType=chart.chartData.type;
    var filename=chart.chartData.filename+'.png';

    //var hash=chartMD5(chart);

    //todo: put file in user folders and divide them by date/day/first letter of the file to avoid speed issues

    //var filename=hash+'.png';

    phPage.open("./d3/d3shell.html", function (status) {
        phPage.evaluate(function (params,cType) {


            if (cType=='line')
                line(params);
            else if (cType=='radial')
                radial(params);
            else if (cType=='bar')
                bar(params);
            return document.querySelector("#chart").getBoundingClientRect();

        }, function (result) {
            phPage.renderBase64('PNG', function (pic) {
                var s3bucket = new AWS.S3({params: {Bucket: bucketName}});
                s3bucket.createBucket(function() {
                    var data = {ACL: 'public-read',ContentType:"image/png",Key: filename, Body: new Buffer(pic, 'base64')};
                    s3bucket.putObject(data, function(err, data) {
                        if (err) {
                            res.error("error producing image");
                            console.log("Error uploading data: ", err);
                        } else {
                            /*
                            var chartDBData={
                                //hash:hash,
                                "filename":filename,
                                url:'https://s3.amazonaws.com/knowtify-charts/'+filename,
                                chartData:chart.chartData,
                                updated:new Date()
                            };
                            */
                            //req.charts.insert(chartDBData,function(e,o){});
                            //res.redirect(chartDBData.url);
                            res.json({ chart_url: 'https://s3.amazonaws.com/knowtify-charts/'+filename });
                            console.log("Successfully uploaded file " + filename);
                        }
                    });
                });


            });
        },params,chartType);

    });

};

chartMD5= function(chart)
{
    return md5(JSON.stringify(chart.chartData));
};
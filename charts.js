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
        phPage.set('viewportSize', {width: 500, height: 500});
        console.log("phantom js ready to go");
    });
}, {
    dnodeOpts: {
        weak: false
    }
});

exports.line = function (req, res) {
    var json = req.body;
    //var customData=[3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2];
    var customData = json.line;
    var chartType="line";
    var chart = {
        chartData:{
            data:customData,
            type:chartType
        }
    };
    req.chart=chart;
    knowtifyChart(req,res);
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
                res.json({ chart_url: chart.url })
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


createChart = function (req, res,chart) {
    var customData=chart.chartData.data;
    var chartType=chart.chartData.type;

    var hash=chartMD5(chart);

    //todo: put file in user folders and divide them by date/day/first letter of the file to avoid speed issues

    var filename=hash+'.png';

    phPage.open("./d3/d3shell.html", function (status) {
        phPage.evaluate(function (custom,cType) {


            if (cType=='line')
                line(custom);
            else if (cType=='radial')
                radial(custom);
            else if (cType=='bar')
                bar(custom);
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
                            var chartDBData={
                                hash:hash,
                                "filename":filename,
                                url:bucketPublicUrl+filename,
                                chartData:chart.chartData,
                                updated:new Date()
                            };
                            req.charts.insert(chartDBData,function(e,o){});
                            //res.redirect(chartDBData.url);
                            res.json({ chart_url: chartDBData.url });
                            console.log("Successfully uploaded file " + filename);
                        }
                    });
                });


            });
        },customData,chartType);

    });

};

chartMD5= function(chart)
{
    return md5(JSON.stringify(chart.chartData));
};
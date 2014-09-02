var phantom = require('phantom');
var phantomInstance;


phantom.create(function (ph) {
    phantomInstance = ph;
}, {
    dnodeOpts: {
        weak: false
    }
});
exports.pie = function (req, res) {
    phantomInstance.createPage(function (page) {
        page.set('viewportSize', {width: 500, height: 500});
        page.open("./d3shell.html", function (status) {
            page.evaluate(function () {
                //this code is executed inside the html page
                return document.querySelector("#viewport").getBoundingClientRect();
            }, function (result) {
                page.renderBase64('PNG', function (pic) {
                    res.setHeader('content-type', 'image/png');
                    res.end(new Buffer(pic, 'base64'));
                    console.log("opened? ", status);
                });
            });

        });
    });

}
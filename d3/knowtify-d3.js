function line(params,yData)
{
    /* implementation heavily influenced by http://bl.ocks.org/1166403 */

    // define dimensions of graph
    var m = [80, 80, 80, 80]; // margins
    var w = params.width - m[1] - m[3]; // width
    var h = params.height - m[0] - m[2]; // height

    // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
    //var data = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, params.data.length]).range([0, w]);
    //var x_axis_label = [params.x_axis_from,params.x_axis_to];
    /*
    for (var i=0;i<(params.data.length-2);i++){
        x_scale.push('');
    }
    x_scale.push(params.x_axis_to)
    */
    //var x = d3.scale.ordinal().domain(x_axis_label).range([0, w]);

    var max_y = 0;
    for(var i=0;i<params.data.length;i++){
        var y_val = params.data[i];
        if(y_val > max_y){
            max_y = y_val;
        }
    }
    
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scale.linear().domain([0, max_y]).range([h, 0]);
    // automatically determining max range can work something like this
    // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis");

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#chart").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // create xAxis
    //var xAxis = d3.scale.ordinal().domain(params.x_axis_labels).range([0, w]);
    //var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);

    var xRange = [];
    for(var i=0;i<params.x_axis_labels.length;i++){
        xRange.push(i*w/(params.x_axis_labels.length-1));
    }

    var xScale = d3.scale.ordinal().domain(params.x_axis_labels).range(xRange);
    var xAxis = d3.svg.axis()
        .scale(xScale);
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);


    if(params.show_y_axis){
        // create left yAxis
        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
        // Add the y-axis to the left
        graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);
    }

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("svg:path")
        .attr("d", line(params.data))
        .attr("fill","none")
        .attr("stroke-width",3)
        .attr("stroke","red");


}
function bar(data){
    var margin = {top: 30, right: 20, bottom: 30, left: 80},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "%");

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); });

}


function radial(){
    var percent = 35;
    var el = document.getElementById('chart')
    var deg = parseInt(percent*3.6);
    var vis = d3.select(el).append("svg")
    var pi = 3;

    var arc = d3.svg.arc()
        .innerRadius(60)
        .outerRadius(90)
        .startAngle(0 * (pi/180)) //converting from degs to radians
        .endAngle(360 * (pi/180)) //just radians

    vis.append("path")
        .attr("d", arc)
        .attr("fill","#000")
        .attr("opacity",".15")
        .attr("transform", "translate(90,90)")

    var arc = d3.svg.arc()
        .innerRadius(65)
        .outerRadius(85)
        .startAngle(0 * (pi/180)) //converting from degs to radians
        .endAngle(deg * (pi/180)) //just radians

    vis.append("path")
        .attr("d", arc)
        .attr("fill","#000")
        .attr("opacity",".7")
        .attr("transform", "translate(90,90)")
}

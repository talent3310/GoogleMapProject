/**
 * Created by djboo on 4/18/2016.
 */

var numFloors = ["0", "1-5", "6-10", "11-20", "21-30", "31+"];

FloorsChart = function (_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    console.log(this.data);

    this.initVis();
};

FloorsChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 40, bottom: 60, left: 60};

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TO-DO: Overlay with path clipping
    //vis.svg.append("defs").append("clipPath")
    //    .attr("id", "clip")
    //    .append("rect")
    //    .attr("width", vis.width)
    //    .attr("height", vis.height);

    // Scales and axes
    vis.x = d3.scale.ordinal()
        .domain(numFloors)
        .rangeRoundBands([0, vis.width],.1);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("text")
        .attr("x", 200)
        .attr("y", 0)
        .text("Number of Buildings per Number of Floors")
        .style("stroke", "#ffffff");

    // TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
};

/*
 * Data wrangling
 */

FloorsChart.prototype.wrangleData = function(){
    var vis = this;

    var sel = document.getElementById("property-choice");
    var choice = sel.options[sel.selectedIndex].value;

    // Filter bars based on selections
    var filtered = vis.data.filter(function (d) {
        if (choice == "all") {
            return true;
        }
        else if (choice == "residential") {
            return d["PTYPE"] < 199;
        }
        else if (choice == "commercial") {
            return (300 <= d["PTYPE"] && d["PTYPE"] < 400);
        }
        else {
            return (400 <= d["PTYPE"] && d["PTYPE"] < 500);
        }
    });

    // Encode the floor info while wrangling the data
    var floorinfo = [
        {"floornum": "0", "amount": 0},
        {"floornum": "1-5", "amount": 0},
        {"floornum": "6-10", "amount": 0},
        {"floornum": "11-20", "amount": 0},
        {"floornum": "21-30", "amount": 0},
        {"floornum": "31+", "amount": 0}
    ];

    filtered.forEach(function (d) {
        if (d["NUM_FLOORS"] == 0) {
            floorinfo[0]["amount"] += 1;
        }
        else if (d["NUM_FLOORS"] <= 5) {
            floorinfo[1]["amount"] += 1;
        }
        else if (d["NUM_FLOORS"] <= 10) {
            floorinfo[2]["amount"] += 1;
        }
        else if (d["NUM_FLOORS"] <= 20) {
            floorinfo[3]["amount"] += 1;
        }
        else if (d["NUM_FLOORS"] <= 30) {
            floorinfo[4]["amount"] += 1;
        }
        else {
            floorinfo[5]["amount"] += 1;
        }
    });

    // In the first step no data wrangling/filtering needed
    vis.displayData = floorinfo;

    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

FloorsChart.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d["amount"];
    })
    ]);

    // Draw the bars
    var bars = vis.svg.selectAll(".bar")
        .data(vis.displayData);

    bars.enter().append("rect")
        .attr("class", "bar");

    bars
        .attr("x", function(d) {
            return vis.x(d["floornum"]);
        })
        .attr("width", vis.x.rangeBand())
        .attr("y", function(d) {
            return vis.y(d["amount"]);
        })
        .attr("height", function(d) {
            return vis.height - vis.y(d["amount"]);
        })
        .attr("fill", "white");

    // TO-DO: Update tooltip text

    bars.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};


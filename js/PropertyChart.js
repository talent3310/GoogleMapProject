/**
 * Created by djboo on 4/18/2016.
 */

PropertyChart = function (_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    console.log(this.data);

    this.initVis();
};

PropertyChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 80, bottom: 120, left: 60 };

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
        .text("Highest Property Values (in millions of $)")
        .style("stroke", "#ffffff");

    // TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
};

/*
 * Data wrangling
 */

PropertyChart.prototype.wrangleData = function(){
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

    console.log(filtered);

    // Only keep the top 20 bars
    filtered.sort(function(a,b) {
        return b["GROSS_VALUE"] - a["GROSS_VALUE"];
    });

    // In the first step no data wrangling/filtering needed
    vis.displayData = filtered.slice(0,30);

    // Update the visualization
    vis.updateVis();
};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

PropertyChart.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
            return d["GROSS_VALUE"]/1000000;
        })
    ]);

    vis.x.domain(vis.displayData.map(function(d) {
        return d["full_address"];
    }));

    // Draw the bars
    vis.bars = vis.svg.selectAll(".bar")
        .data(vis.displayData);

    vis.bars.enter().append("rect")
        .attr("class", "bar");

    vis.bars
        .attr("x", function(d) {
            return vis.x(d["full_address"]);
        })
        .attr("width", vis.x.rangeBand())
        .attr("y", function(d) {
            return vis.y(d["GROSS_VALUE"]/1000000);
        })
        .attr("height", function(d) {
            return vis.height - vis.y(d["GROSS_VALUE"]/1000000);
        })
        .attr("fill", function(d) {
            if (d["PTYPE"] < 199) {
                return "green";
            }
            else if (300 <= d["PTYPE"] && d["PTYPE"] < 400) {
                return "red";
            }
            else {
                return "blue";
            }
        });

    // TO-DO: Update tooltip text

    vis.bars.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");
    vis.svg.select(".y-axis").call(vis.yAxis);
};


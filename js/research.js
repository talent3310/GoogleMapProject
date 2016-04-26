/**
 * Created by djboo on 4/18/2016.
 */

// Store the upcoming data
var valueData = [];

// Start by loading the data
startHere();

// Once the data is in the required format, put it in the right spot
function dataLoaded(_valueData) {
    valueData = _valueData;
    initVis();
}

// Load the data correctly
function startHere () {
    d3.json("data/data2015.json", function(errorValue, ValueData) {
        if (!errorValue) {
            dataLoaded(ValueData);

            //d3.csv("data/data2015.csv", function(error, routeData) {
                //if (!error) {
                //    dataLoaded(valueData);
                //}

        }
    });
}

function initVis () {
    console.log(valueData);

    ptypechart = new PropertyChart("ptype", valueData);

    floorschart = new FloorsChart("floors", valueData);
}

function selection () {
    ptypechart.wrangleData();

    floorschart.wrangleData();
}
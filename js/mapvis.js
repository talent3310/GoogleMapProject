//initialize map //
L.mapbox.accessToken = 'pk.eyJ1IjoidmluY2VudGppYW5nNzc3IiwiYSI6IkNUeUV4LWMifQ.OuNUoSfqSTSyu4R-dffXKQ';
var map = L.mapbox.map('map', 'mapbox.light')
	.setView([42.3201, -71.0589], 13);

var customLayer = L.geoJson(null, {
	// http://leafletjs.com/reference.html#geojson-style
	pointToLayer: function (feature, latlng) {
		return L.circle(latlng,feature.properties.GROSS_AREA/10000);
	}
});

customLayer.on('ready', function() {
	// featureLayer.getBounds() returns the corners of the furthest-out markers,
	// and map.fitBounds() makes sure that the map contains these.
	//map.fitBounds(customLayer.getBounds());
});

omnivore.csv('data/assorted_dataset.csv',{
		latfield: 'Lat',
		lonfield: 'Lon'
	},customLayer)
	.on('ready', function(layer) {
		// An example of customizing marker styles based on an attribute.
		// In this case, the data, a CSV file, has a column called 'state'
		// with values referring to states. Your data might have different
		// values, so adjust to fit.
		this.eachLayer(function(marker) {

			// Bind a popup to each icon based on the same properties
			marker.bindPopup(marker.toGeoJSON().properties.OWNER + ', ' +
				marker.toGeoJSON().properties.OWNER_MAIL_ADDRESS);
			marker.on('mouseover', function (e) {
				openNav();
				$("#marketTrend").html(marker.toGeoJSON().properties.OWNER + ', ' +
					marker.toGeoJSON().properties.OWNER_MAIL_ADDRESS);
			});
		});
	}).addTo(map);
/// <reference path="markerAggregator.d.ts" />
/// <reference path="others.d.ts" />
/* global L */
(function(context){
'use strict';
	
	class MarkerAggregator implements IAggregator {

		// container with private vars
		_private = {
			// parent map
			_map: {},
			// leaflet base markers
			_baseMarkers: [],
			// leaflet composite markers
			_compositeMarkers: [],
			// coords, comments, etc. of base markers
			_baseMarkersData: [],
			// coords, comments, etc. of composite markers
			_compositeMarkersData: [],
			// zoom level up to which (<) base markers are displayed on the map
			_baseZoom: 10,
			// how much should zoom change to trigger markers change
			_zoomStep: 2,
			// size of the window to combine base markers at _baseZoom in degrees
			_baseWindowSize: 0.01,
			// refference center of the aggregator, calculated at first rendering
			_center: null,
			
			_zoomLevels : {}
		};
		constructor (map: any, options: IAggregatorOptions) {
			if (options) {
				this._private._map = map;
				this._private._baseZoom = options.baseZoom || this._private._baseZoom;
				this._private._zoomStep = options.zoomStep || this._private._zoomStep;
				this._private._baseWindowSize = options.baseWindowSize || this._private._baseWindowSize;
			}
			
			for (var j=(this._private._baseZoom - this._private._zoomStep); j<)
		}
		/*** add new leaflet marker to the aggregator 
		 * @marker - leaflet marker object
		 * @return - number of base markers if successful, -1 if not
		*/
		addMarker (coords: any): number {
			// var marker;	// leaflet marker
			if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
				this._private._baseMarkersData.push({
					lat: coords[0],
					lng: coords[1]
				});
				// marker = L.marker([coords[0], coords[1]]); 
			} else if ((coords.lat || coords.lat === 0) && (coords.lng || coords.lng === 0)) {
				this._private._baseMarkersData.push({
					lat: coords.lat,
					lng: coords.lng
				});
				// marker = L.marker([coords.lat, coords.lng]);
			} else {
				return -1;
			}
			
			if (!this._private._center && this._private._baseMarkersData.length) {
				// calculate center using the first one
				this._private._center = {
					lat: this._private._baseMarkersData[0].lat,
					lng: this._private._baseMarkersData[0].lng
				}
			}
 
// marker.addTo(this._private._map);
			
			// add new marker
			// this._private._baseMarkers.push(marker);
			// return counter
			return this._private._baseMarkersData.length;
		}
		/*** return base markers */
		getBaseMarkers (): any [] {
			return this._private._baseMarkersData;
		}
	}

	// inject
	context.MarkerAggregator = MarkerAggregator;

}(this));
/// <reference path="markerAggregator.d.ts" />
/// <reference path="others.d.ts" />
/* global L */
(function(context){
'use strict';
	
	class MarkerAggregator implements IAggregator {
		
		// worker to perform calculations
		_blob = URL.createObjectURL( new Blob([ '(',
				function(){
					var work = self;
					var q = 0;
					
					function calculateCenter (data: any) {
						// calculate markers center, but only first time (it's null then)
						var avgLat = 0, avgLng = 0;
						for (var i=0; i<data.baseMarkers.length; i++) {
							avgLat += +data.baseMarkers[i].lat;
							avgLng += +data.baseMarkers[i].lng;
						}
						avgLat /= data.baseMarkers.length;
						avgLng /= data.baseMarkers.length;
						data.center = {lat: avgLat, lng: avgLng};
data.test = 'added';
					}
					
					self.addEventListener('message', function (input) {
						// debugger;
							var data = JSON.parse(input.data);
							if (!data.center) {
								calculateCenter(data);
							}
							
							work.postMessage(JSON.stringify(data));
					}, false);
					
				}.toString(),
			')()' ], { type: 'application/javascript' } ) );
		// container with private vars
		_private = {
			// parent map
			_map: {},
			// leaflet base markers
			// _baseMarkers: [],
			// coords, comments, etc. of base markers that is affected by any operation on aggregator
			_baseMarkersData: [],
			// when rendering those data moved here, what represents current state and can be changed only by rendering
			_baseMarkersCurrentData: [],
			// coords, comments, etc. of composite markers that is affected by any operation on aggregator
			_compositeMarkersData: [],
			// when rendering those data moved here, what represents current state and can be changed only by rendering
			_compositeMarkersCurrentData: [],
			// zoom level up to which (<) base markers are displayed on the map
			_baseZoom: 10,
			// how much should zoom change to trigger markers change
			_zoomStep: 3,
			// size of the window to combine base markers at _baseZoom in degrees
			_windowSize: 0.01,
			// refference center of the aggregator, calculated at first rendering
			_center: null,
			// worker instantiation
			_worker: new Worker(this._blob)
		};
		constructor (map: any, options: IAggregatorOptions) {
			if (options) {
				this._private._map = map;
				this._private._baseZoom = options.baseZoom || this._private._baseZoom;
				this._private._zoomStep = options.zoomStep || this._private._zoomStep;
				this._private._windowSize = options.windowSize || this._private._windowSize;
			}
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
		/*** calculates coordinates for markers on all levels
		 * and creates them, but doesn't display yet
		 */
		render (): Promise {
			var self = this;
			
			function processWorkerOutput (e) {
				var workerOutput = JSON.parse(e.data);
console.log(workerOutput);
				if (!self._private._center) {
					// doesn't have center yet
					self._private._center = workerOutput.center;
				}
				self._private._worker.removeEventListener('message', processWorkerOutput, false);
			}
			self._private._worker.addEventListener('message', processWorkerOutput, false);
			
			var promise = new Promise( (resolve, reject) => {
				self._private._worker.postMessage(JSON.stringify({
					baseMarkers: self._private._baseMarkersData,
					compositeMarkers: 	self._private._compositeMarkersData,
					center: self._private._center,
					baseZoom: self._private._baseZoom,
					zoomStep: self._private._zoomStep,
					windowSize: self._private._windowSize
				}));
				
			});

			return promise;
		}
	}

	// inject
	context.MarkerAggregator = MarkerAggregator;

}(this));
/// <reference path="./../../typings/tsd.d.ts" />
/* global L */

import {D2tree} from './D2tree.ts';

// (function(context){
// 'use strict';
	
export class MarkerAggregator implements IAggregator {

		// container with private vars
		private _map: IMap;
		// leaflet base markers
		// private _baseMarkers: MarkerType [];
        private _baseMarkersTree: ID2Tree<MarkerType>;
		// leaflet composite markers
		// private _compositeMarkers = {};
		// coords, comments, etc. of base markers
		// private _baseMarkersData = [];
		// // coords, comments, etc. of composite markers
		// private _compositeMarkersData = [];
		// zoom level up to which (>=) base markers are displayed on the map
		private _baseZoom: number;
		// zoom level below which (<=) new markers are not created 
		private _minZoom: number;
		// how much should zoom change to trigger markers change
		private _zoomStep: number;
		// current zoom level
		private _currentZoomLevel: number;
		// size of the window to combine base markers at _baseZoom in degrees
		private _baseWindowSize: number;
		// refference easter and southern marker of the aggregator
		private _eastSouth: any;
		// marker internal id
		private _id: number;
        
        private _compositeIcon: any;
		
		private _zoomLevels: {
            windowSize: number,
            // markers: any,
            compositeMarkersTree: ID2Tree<MarkerType>
        } [];
			
		constructor (map: IMap, options: IAggregatorOptions) {
            
            // assume L to be a global var
            if (!L.version) console.error('Can\'t find Leaflet library');
			if (options) {
				this._map = map;
				this._baseZoom = options.baseZoom || 15;
				this._zoomStep = options.zoomStep || 1;
				this._minZoom = options.minZoom || 7;
				this._minZoom = this._baseZoom  - (this._baseZoom - this._minZoom) / 2 * 2;
				this._baseWindowSize = options.baseWindowSize || 0.005;
			}
            
            this._id = 0;
            this._eastSouth = null;
            
            // this._baseMarkers = [];
            this._baseMarkersTree = null;
            
            this._zoomLevels = [];
 
			
			for (var j=this._baseZoom; j>=this._minZoom; j-=this._zoomStep) {
console.log(j);
				this._zoomLevels[j] = {
					windowSize: this._baseWindowSize * Math.pow(1.7, this._baseZoom - j),
					// markers: {},
                    compositeMarkersTree: null
				};
			}
			
			this._setCurrentZoomLevel();
		}
		
        /*** calculate what set of markers (zoomLevel) to display based on the current map zoom */
        private _setCurrentZoomLevel () {
			var mapZoom = this._map.getZoom();
			if (mapZoom <= this._minZoom) { this._currentZoomLevel = this._minZoom}
			else if (mapZoom >= this._baseZoom) { this._currentZoomLevel = this._baseZoom}
			else {
				this._currentZoomLevel = this._baseZoom  - Math.floor((this._baseZoom - mapZoom) / 2) * 2;
			}
		}
        
        /*** zoom in by zoom step */
        private _zoomin (coords: PointType) {
            this._map.setView(coords, this._currentZoomLevel+this._zoomStep);
        }
        
        /*** when first marker is added iterate over all zoom levels and create trees 
         * to minimize computing expenses don't recalculate composite marker position
         * just change it's content - if there is no base markers in it make it null
        */
		private _createCompositeMarkers (coords: PointType, baseMarker: MarkerType) {
            var baseZoom = this._baseZoom, zoomStep = this._zoomStep, minZoom = this._minZoom,
                zoomLevels = this._zoomLevels;  
			// apply changes to corresponding composite markers
			var latIndex: number, lngIndex: number;
			var compositeMarkerRef: any;
            var nearest: NearestType<MarkerType>;
            var compositeMarker: MarkerType;
            // var compositeIcon = L.divIcon({html: '<div class="composite-icon"><p>qq</p></div>'});
			// for every zoom level
			for (var j=minZoom; j < baseZoom; j+=zoomStep) {
                if (!zoomLevels[j].compositeMarkersTree) {
                    // no composites yet
                    // create c marker
                    compositeMarker = {
                        marker: L.marker(
                            [coords.lat, coords.lng],
                            {icon: L.divIcon({html: '<div class="composite-icon"><p>1</p></div>'})}
                        ).on(`click`, this._zoomin),
                        refs: [baseMarker]
                    }
                    // create a tree with this c marker
                    zoomLevels[j].compositeMarkersTree = new D2tree(coords, compositeMarker);
                } else {
                    // search for the nearest composite on this zoom level
                    nearest = zoomLevels[j].compositeMarkersTree.findNearest( baseMarker.marker.getLatLng() );
                    // within the radius of windowSize
                    if (nearest.dist <= zoomLevels[j].windowSize) {
                        // if exists, add a link to the new base marker
                        // but first remove from the map if necessary
                        if (j === this._currentZoomLevel) {
                            this._map.removeLayer(nearest.content.marker);
                        }
                        compositeMarker = nearest.content;
                        compositeMarker.refs.push(baseMarker);
                        // recalculate marker position
                        // important! in order to avoid recalculating the whole tree
                        // lat and lng of the tree node stays the same
                        // but how it is displayed to the user changes
                        compositeMarker.marker = L.marker([
                            compositeMarker.refs.reduce( (pv, cv) => pv + cv.marker.getLatLng().lat, 0) / compositeMarker.refs.length,
                            compositeMarker.refs.reduce( (pv, cv) => pv + cv.marker.getLatLng().lng, 0) / compositeMarker.refs.length,
                        ], {icon: L.divIcon(
                                {html: `<div class="composite-icon"><p>${compositeMarker.refs.length}</p></div>`}
                        )});
                    } else {
                        // if not, create a new c marker
                        compositeMarker = {
                            marker: L.marker([coords.lat, coords.lng], {
                                        icon: L.divIcon({html: '<div class="composite-icon"><p>1</p></div>'})
                                    }),
                            refs: [baseMarker]
                        }    
                        // add to the tree
                        zoomLevels[j].compositeMarkersTree.addLeaf(coords, compositeMarker);
                    }     
                }
                // click handler
                compositeMarker.marker.on(
                    `click`,
                    () => {this._zoomin(compositeMarker.marker.getLatLng())},
                    this
                );
                // link base marker to it
                // !!! mutating method argument, circular linking !!!
                baseMarker.refs.push(compositeMarker);
                
                // if necessary, show on the map
                if (j === this._currentZoomLevel) {
                    compositeMarker.marker.addTo(this._map);
                }
				// calculate composite marker's position
				// latIndex = Math.floor((baseMarkerRefLink.getLatLng().lat - this._eastSouth.lat) / this._zoomLevels[''+j].windowSize);
				// lngIndex = Math.floor((baseMarkerRefLink.getLatLng().lng - this._eastSouth.lng) / this._zoomLevels[''+j].windowSize);
				// if (!this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex] ||
				// 	this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].baseMarkers.length === 0) {
				// 		compositeMarkerRef = L.marker([ baseMarkerRefLink.getLatLng().lat, baseMarkerRefLink.getLatLng().lng ]); 
				// 		// first marker in this cell
				// 		this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex] = {
				// 			marker: compositeMarkerRef,
				// 			baseMarkers: [baseMarkerRefLink]
				// 		}
				// } else {
				// 	// save parameters of the old composite marker
				// 	var counter = this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].baseMarkers.length;
				// 	var oldLat = this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].marker.getLatLng().lat,
				// 		oldLng = this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].marker.getLatLng().lng;
				// 	// remove it from the map
				// 	this._map.removeLayer(this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].marker);
				// 	// insert new composite marker
				// 	this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].marker = compositeMarkerRef =
				// 		L.marker([ (baseMarkerRefLink.getLatLng().lat + oldLat*counter) / (counter+1),
				// 					(baseMarkerRefLink.getLatLng().lng + oldLng*counter) / (counter+1)
				// 		])
				// 	// reference to the base marker
				// 	this._zoomLevels[''+j].markers[latIndex+'|'+lngIndex].baseMarkers.push(baseMarkerRefLink);
				// }
				// // check whether it's time to display current composite marker
				// if (j === this._currentZoomLevel) {
				// 	compositeMarkerRef.addTo(this._map);
				// }
			}	
		}
		
        // public addMarker (coords: any): number {
		/*** add new leaflet marker to the aggregator 
		 * @marker - leaflet marker object
		 * @return - number of base markers if successful, -1 if not
		 * because it uses eastern-southern point as a reference, it's better to start adding markers from
		 * the most easter and most southern markers to prevent general recalculation  
		*/
		public addMarker (coords: any): number {
			var localCoords = {lat:0, lng:0};
			// read coordinates 
			if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
				localCoords.lat = coords[0];
				localCoords.lng = coords[1]; 
			} else if ((coords.lat || coords.lat === 0) && (coords.lng || coords.lng === 0)) {
				localCoords.lat = coords.lat;
				localCoords.lng = coords.lng; 
			} else {
				return -1;
			}
            
            // create leaf content - marker
            var marker: MarkerType = {
                marker: L.marker([localCoords.lat, localCoords.lng]),
                aId: ++this._id,
                refs: []
            }
            // this._baseMarkers.push(marker);
            // this tree of no use now, maybee for the future
            // if it's the first marker inserted
            if (!this._baseMarkersTree) {
                this._baseMarkersTree = new D2tree(localCoords, marker);
                // link zoomLevels[baseZoom] to the baseMarkerTree for the sake of rerender method simplicity
                this._zoomLevels[this._baseZoom].compositeMarkersTree = this._baseMarkersTree;
            } else {
                this._baseMarkersTree.addLeaf(localCoords, marker);
            }
            this._createCompositeMarkers(localCoords, marker);
            
            // if zoom is big enough display base markers
            if (this._baseZoom - this._zoomStep < this._currentZoomLevel) {
                marker.marker.addTo(this._map);
            }
			
			// var basePointShift = false;
			// // calculate center using the first one
			// if (!this._eastSouth) {
			// 	this._eastSouth = {
			// 		lat: localCoords.lat - 0.00001,
			// 		lng: localCoords.lng + 0.00001
			// 	}
			// } else if (this._eastSouth.lat >= localCoords.lat) {
			// 	// new base point
			// 	this._eastSouth.lat = localCoords.lat - 0.00001;
			// 	basePointShift = true;
			// } else if (this._eastSouth.lng <= localCoords.lng) {
			// 	// -//-
			// 	this._eastSouth.lng = localCoords.lng + 0.00001;
			// 	basePointShift = true;
			// }
			
			// if (basePointShift) {
			// 	// recalculate everything
			// 	// remove composite markers
			// 	for (var j=this._baseZoom-this._zoomStep; j>=this._minZoom; j-=this._zoomStep) {
			// 		// markers on the current zoom layer (currently displayed) from the map
			// 		if (j === this._currentZoomLevel) {
			// 			for (var k in this._zoomLevels[''+j].markers) {
			// 				this._map.removeLayer(this._zoomLevels[''+j].markers[k].marker);	
			// 			}
			// 		}
			// 		// from _zoomLevels
			// 		this._zoomLevels[''+j] = {
			// 			windowSize: this._baseWindowSize * Math.pow(1.7, this._baseZoom - j),
			// 			markers: {}
			// 		};
			// 	}
			// 	// remove links to them from base markers
			// 	// for every existing base marker recalculate composite
			// 	for (var j=0; j<this._baseMarkers.length; j++) {
			// 		this.createCompositeMarkers(this._baseMarkers[j]);
			// 	}
			// } else {
			// 	// just add composite markers including given base marker
			// 	this.createCompositeMarkers(baseMarkerRef);	
			// }
			
			
			
 
			// if (this._currentZoomLevel === this._baseZoom) {
			// 	// display base marker
			// 	baseMarkerRef.addTo(this._map);
			// }

			// // return new base marker id
			// return baseMarkerRef.aId;
            return 0;
		}
		/*** return base markers */
		public getBaseMarkers (): MarkerType [] {
			return this._baseMarkersTree.traverse();
		}
        
        /*** redraw markers on the map */
        private _rerender () {
// console.log('inside rerender');
            var tmpLMarkers: MarkerType [];
            var j: number;
            // store old zoom level and calculate new one
            var oldZoom = this._currentZoomLevel;
            this._setCurrentZoomLevel();
            
            if (this._zoomLevels[this._currentZoomLevel] &&
                    (this._zoomLevels[this._currentZoomLevel] !== this._zoomLevels[oldZoom])) {
                // if new zoom level exists and is not the same as the previous
                tmpLMarkers = this._zoomLevels[oldZoom].compositeMarkersTree.traverse();
                // remove old markers from the map
                for (j=0; j < tmpLMarkers.length; j++) {
                    this._map.removeLayer(tmpLMarkers[j].marker);
                }
                tmpLMarkers = this._zoomLevels[this._currentZoomLevel].compositeMarkersTree.traverse();
                // add new markers
                for (j=0; j < tmpLMarkers.length; j++) {
                    tmpLMarkers[j].marker.addTo(this._map)
                }
            } else {
// console.log(`no need in rerendering`);
            }
                 
                
//                 this._zoomLevels[oldZoom];
// 				// var i;
// 				this._setCurrentZoomLevel();
// console.log(this._zoomLevels[oldZoom].compositeMarkersTree.traverse());
// console.log(this._zoomLevels[this._currentZoomLevel].compositeMarkersTree.traverse());



				// if (oldZoom !== self._currentZoomLevel) {
				// 	// need to display different group of markers
				// 	// hide old
				// 	if (oldZoom === self._baseZoom) {
				// 		// hide base markers
				// 		for (i=0; i<self._baseMarkers.length; i++) {
				// 			self._map.removeLayer(self._baseMarkers[i]);
				// 		}
				// 	} else {
				// 		// hide composite markers
				// 		for (var key in self._zoomLevels[''+oldZoom].markers) {
				// 			self._map.removeLayer(self._zoomLevels[''+oldZoom].markers[key].marker);
				// 		}
				// 	}		
				// 	// display new
				// 	if (self._zoomLevels[''+self._currentZoomLevel]) {
				// 		// composite markers
				// 		for (var key in self._zoomLevels[''+self._currentZoomLevel].markers) {
				// 			self._zoomLevels[''+self._currentZoomLevel].markers[key].marker.addTo(self._map);
				// 		}
				// 	} else {
				// 		// base markers
				// 		for (i=0; i<self._baseMarkers.length; i++) {
				// 			self._baseMarkers[i].addTo(self._map);
				// 		}
				// 	}
					
				// }
			}
		/*** start listen for map's zoom change */
		public start (): void {
            // take care not to call rerender many times
            this.stop();
console.log('inside start');
			this._map.on('zoomend', this._rerender, this);
            // initialize
            this._rerender();
		}
		/*** stop listen for map's zoom change */
		public stop (): void {
console.log('inside stop');
			this._map.off('zoomend', this._rerender, this);
		}
	}

	// inject
// 	context.MarkerAggregator = MarkerAggregator;

// }(window));
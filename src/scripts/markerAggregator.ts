/// <reference path="./../../typings/tsd.d.ts" />
/* global L */

import {D2tree} from './D2tree.ts';

// (function(context){
// 'use strict';
	
export class MarkerAggregator implements IAggregator {

		// container with private vars
		private _map: IMap;
		// leaflet base markers
		private _baseMarkers: MarkerType [];
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
        // filter settings
        private _filter: FilterType;
        
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
				this._minZoom = options.minZoom || 5;
				this._minZoom = this._baseZoom  - (this._baseZoom - this._minZoom) / 2 * 2;
				this._baseWindowSize = options.baseWindowSize || 0.008;
			}
            
            this._id = 0;
            this._eastSouth = null;
            
            this._baseMarkers = [];
            this._baseMarkersTree = null;
            
            this._zoomLevels = [];
 
            // set up filter, disabled by default
            this._filter = {
                buyVal: -1,
                sellVal: -1,
                rad: false,
                center: {lat: 0, lng: 0},
                radVal: 10
            }
			
			this._resetZoomLevels();
			
			this._setCurrentZoomLevel();
		}
        
        // remove all composite markers
        private _resetZoomLevels () {
            for (var j=this._baseZoom; j>=this._minZoom; j-=this._zoomStep) {
				this._zoomLevels[j] = {
					windowSize: this._baseWindowSize * Math.pow(1.7, this._baseZoom - j),
                    compositeMarkersTree: null
				};
			}
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
                        ).on(`click`, this._zoomin).bindLabel(baseMarker.buy + ' / ' + baseMarker.sell, { noHide: true }),
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
                        compositeMarker.buy = compositeMarker.refs.reduce( (pv, cv) => (cv.buy < pv) ? cv.buy : pv,
                                                                                compositeMarker.refs[0].buy);
                        compositeMarker.sell = compositeMarker.refs.reduce( (pv, cv) => (cv.sell > pv) ? cv.sell : pv,
                                                                                compositeMarker.refs[0].sell);
                        compositeMarker.marker.bindLabel(
                            compositeMarker.buy + ' / ' + baseMarker.sell, { noHide: true });
                    } else {
                        // if not, create a new c marker
                        compositeMarker = {
                            marker: L.marker([coords.lat, coords.lng], {
                                        icon: L.divIcon({html: '<div class="composite-icon"><p>1</p></div>'})
                                    }).bindLabel(baseMarker.buy + ' / ' + baseMarker.sell, { noHide: true }),
                            refs: [baseMarker]
                        }    
                        // add to the tree
                        zoomLevels[j].compositeMarkersTree.addLeaf(coords, compositeMarker);
                    }     
                }
                // click handler
                compositeMarker.marker.on(
                    `click`,
                    () => {this._zoomin(compositeMarker.marker.getLatLng());},
                    this
                );
                // link base marker to it
                // !!! mutating method argument, circular linking !!!
                baseMarker.refs.push(compositeMarker);
                
                // if necessary, show on the map
                if (j === this._currentZoomLevel) {
                    compositeMarker.marker.addTo(this._map);
                }
			}	
		}
        
        /** checks whether base marker is removed by current filter settings */
        private _checkFilter (marker: MarkerType): boolean {
            if (marker.buy < this._filter.buyVal) return false;
            if (marker.sell > this._filter.sellVal) return false;
            if (this._filter.rad && 
                marker.marker.getLatLng().distanceTo(this._filter.center) > this._filter.radVal) return false;
            
            return true;
        }
		
        /** external interface for adding markers 
         * @coords - marker coordinates either PointType or [lat, lng]
         * @return - base marker id
        */
        public addNewMarker (coords: any, bankData: MarkerDataType): number {
            var localCoords = {lat:0, lng:0};
            var tempNum: number;
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

            // check prices
            if (bankData.buy && bankData.sell) {
                // check the same bank
                if (this._baseMarkers.reduce( (pv, cv) => {
                       if (!pv && (cv.bankName !== bankData.bankName || cv.address !== bankData.address)) return false;
                       else return true;  
                }, false)) return undefined;
                
                // create leaf content - marker
                var marker: MarkerType = {
                    marker: L.marker([localCoords.lat, localCoords.lng]),
                    aId: ++this._id,
                    refs: [],
                    buy: bankData.buy,
                    sell: bankData.sell,
                    bankName: bankData.bankName,
                    address: bankData.address
                }
                
                // reset filter if necessary
                tempNum = Math.floor((bankData.buy-0.01)*10)/10;
                if (this._filter.buyVal > tempNum || this._filter.buyVal < 0) { this._filter.buyVal = tempNum; }
                tempNum = Math.ceil((+bankData.sell+0.01)*10)/10;
                if (this._filter.sellVal < tempNum || this._filter.sellVal < 0) { this._filter.sellVal = tempNum; }
                
                this._baseMarkers.push(marker);
                
                // text info on the markers
                marker.marker
                    .bindPopup(
                        (bankData.bankName ? '<p>'+bankData.bankName+'</p>' : '') +
                        (bankData.address ? '<p>'+bankData.address+'</p>' : '') +
                        (bankData.tel ? '<p>'+bankData.tel+'</p>' : '') +
                        (bankData.wh ? '<p>'+bankData.wh+'</p>' : '') +
                        (bankData.info ? '<p style="color: red;">'+bankData.info+'</p>' : '')
                    )
                    .bindLabel(bankData.buy + ' / ' + bankData.sell, { noHide: true });
                
                this._addMarker(marker);
                
                return marker.aId;
            } else {
                return undefined;
            }
        }
        
		/*** add new marker to the displayed ones
		 * @localCoords - base marker coordinates
         * @marker - base marker
		*/
		private _addMarker (marker: MarkerType): void {
            var localCoords: PointType = marker.marker.getLatLng();
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
            
            // 
		}
        
        /*** reset filter and recalculate*/
        public filter (newFilter: FilterType): void {
            var i: number;
            // better use Object assign
            this._filter = {
                buyVal: newFilter.buyVal ? newFilter.buyVal : this._filter.buyVal,
                sellVal: newFilter.sellVal ? newFilter.sellVal : this._filter.sellVal,
                rad: newFilter.rad ? true : false,
                center: newFilter.center ? newFilter.center : this._filter.center,
                radVal: newFilter.radVal ? newFilter.radVal : this._filter.radVal,
            };
            
            // hide old markers
            var oldMarkers = this._zoomLevels[this._currentZoomLevel].compositeMarkersTree.traverse(); 
            for (i=0; i < oldMarkers.length; i++) {
                this._map.removeLayer(oldMarkers[i].marker);
            }
            
            // remove old markers
            this._resetZoomLevels();
            this._baseMarkersTree = null;
            
            var markersLeft: MarkerType [] = this._baseMarkers.filter( e => this._checkFilter(e));
            for (i=0; i < markersLeft.length; i++) {
                this._addMarker(markersLeft[i]);
            }
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
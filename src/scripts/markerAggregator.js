/// <reference path="markerAggregator.d.ts" />
/// <reference path="others.d.ts" />
/* global L */
(function (context) {
    'use strict';
    var MarkerAggregator = (function () {
        function MarkerAggregator(map, options) {
            // leaflet base markers
            this._baseMarkers = [];
            // leaflet composite markers
            this._compositeMarkers = {};
            // // coords, comments, etc. of base markers
            // private _baseMarkersData = [];
            // // coords, comments, etc. of composite markers
            // private _compositeMarkersData = [];
            // zoom level up to which (>=) base markers are displayed on the map
            this._baseZoom = 15;
            // zoom level below which (<=) new markera are not created 
            this._minZoom = 7;
            // how much should zoom change to trigger markers change
            this._zoomStep = 1;
            // size of the window to combine base markers at _baseZoom in degrees
            this._baseWindowSize = 0.005;
            // refference easter and southern marker of the aggregator
            this._eastSouth = null;
            // marker internal id
            this._id = 0;
            this._zoomLevels = {};
            if (options) {
                this._map = map;
                this._baseZoom = options.baseZoom || this._baseZoom;
                this._zoomStep = options.zoomStep || this._zoomStep;
                this._minZoom = options.minZoom || this._minZoom;
                this._minZoom = this._baseZoom - (this._baseZoom - this._minZoom) / 2 * 2;
                this._baseWindowSize = options.baseWindowSize || this._baseWindowSize;
            }
            for (var j = this._baseZoom - this._zoomStep; j >= this._minZoom; j -= this._zoomStep) {
                this._zoomLevels['' + j] = {
                    windowSize: this._baseWindowSize * Math.pow(1.7, this._baseZoom - j),
                    markers: {}
                };
            }
            console.log(this._zoomLevels);
            this._setCurrentZoomLevel();
            console.log(this._currentZoomLevel);
        }
        MarkerAggregator.prototype._setCurrentZoomLevel = function () {
            var mapZoom = this._map.getZoom();
            if (mapZoom <= this._minZoom) {
                this._currentZoomLevel = this._minZoom;
            }
            else if (mapZoom >= this._baseZoom) {
                this._currentZoomLevel = this._baseZoom;
            }
            else {
                this._currentZoomLevel = this._baseZoom - Math.floor((this._baseZoom - mapZoom) / 2) * 2;
            }
        };
        MarkerAggregator.prototype.createCompositeMarkers = function (baseMarkerRefLink) {
            // apply changes to corresponding composite markers
            var latIndex, lngIndex;
            var compositeMarkerRef;
            // for every zoom level
            for (var j = this._baseZoom - this._zoomStep; j >= this._minZoom; j -= this._zoomStep) {
                // calculate composite marker's position
                latIndex = Math.floor((baseMarkerRefLink.getLatLng().lat - this._eastSouth.lat) / this._zoomLevels['' + j].windowSize);
                lngIndex = Math.floor((baseMarkerRefLink.getLatLng().lng - this._eastSouth.lng) / this._zoomLevels['' + j].windowSize);
                if (!this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex] ||
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].baseMarkers.length === 0) {
                    compositeMarkerRef = L.marker([baseMarkerRefLink.getLatLng().lat, baseMarkerRefLink.getLatLng().lng]);
                    // first marker in this cell
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex] = {
                        marker: compositeMarkerRef,
                        baseMarkers: [baseMarkerRefLink]
                    };
                }
                else {
                    // save parameters of the old composite marker
                    var counter = this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].baseMarkers.length;
                    var oldLat = this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker.getLatLng().lat, oldLng = this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker.getLatLng().lng;
                    // remove it from the map
                    this._map.removeLayer(this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker);
                    // insert new composite marker
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker = compositeMarkerRef =
                        L.marker([(baseMarkerRefLink.getLatLng().lat + oldLat * counter) / (counter + 1),
                            (baseMarkerRefLink.getLatLng().lng + oldLng * counter) / (counter + 1)
                        ]);
                    // reference to the base marker
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].baseMarkers.push(baseMarkerRefLink);
                }
                // check whether it's time to display current composite marker
                if (j === this._currentZoomLevel) {
                    compositeMarkerRef.addTo(this._map);
                }
            }
        };
        /*** add new leaflet marker to the aggregator
         * @marker - leaflet marker object
         * @return - number of base markers if successful, -1 if not
         * because it uses eastern-southern point as a reference, it's better to start adding markers from
         * the most easter and most southern markers to prevent general recalculation
        */
        MarkerAggregator.prototype.addMarker = function (coords) {
            var localCoords = { lat: 0, lng: 0 };
            // read coordinates 
            if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                localCoords.lat = coords[0];
                localCoords.lng = coords[1];
            }
            else if ((coords.lat || coords.lat === 0) && (coords.lng || coords.lng === 0)) {
                localCoords.lat = coords.lat;
                localCoords.lng = coords.lng;
            }
            else {
                return -1;
            }
            // create base marker
            var baseMarkerRef = L.marker([localCoords.lat, localCoords.lng]);
            baseMarkerRef.aId = ++this._id;
            this._baseMarkers.push(baseMarkerRef);
            var basePointShift = false;
            // calculate center using the first one
            if (!this._eastSouth) {
                this._eastSouth = {
                    lat: localCoords.lat - 0.00001,
                    lng: localCoords.lng + 0.00001
                };
            }
            else if (this._eastSouth.lat >= localCoords.lat) {
                // new base point
                this._eastSouth.lat = localCoords.lat - 0.00001;
                basePointShift = true;
            }
            else if (this._eastSouth.lng <= localCoords.lng) {
                // -//-
                this._eastSouth.lng = localCoords.lng + 0.00001;
                basePointShift = true;
            }
            if (basePointShift) {
                // recalculate everything
                // remove composite markers
                for (var j = this._baseZoom - this._zoomStep; j >= this._minZoom; j -= this._zoomStep) {
                    // markers on the current zoom layer (currently displayed) from the map
                    if (j === this._currentZoomLevel) {
                        for (var k in this._zoomLevels['' + j].markers) {
                            this._map.removeLayer(this._zoomLevels['' + j].markers[k].marker);
                        }
                    }
                    // from _zoomLevels
                    this._zoomLevels['' + j] = {
                        windowSize: this._baseWindowSize * Math.pow(1.7, this._baseZoom - j),
                        markers: {}
                    };
                }
                // remove links to them from base markers
                // for every existing base marker recalculate composite
                for (var j = 0; j < this._baseMarkers.length; j++) {
                    this.createCompositeMarkers(this._baseMarkers[j]);
                }
            }
            else {
                // just add composite markers including given base marker
                this.createCompositeMarkers(baseMarkerRef);
            }
            if (this._currentZoomLevel === this._baseZoom) {
                // display base marker
                baseMarkerRef.addTo(this._map);
            }
            // return new base marker id
            return baseMarkerRef.aId;
        };
        /*** return base markers */
        MarkerAggregator.prototype.getBaseMarkers = function () {
            return this._baseMarkers;
        };
        /*** start listen for map's zoom change */
        MarkerAggregator.prototype.start = function () {
            var self = this;
            console.log('inside start');
            function rerender() {
                console.log('inside rerender');
                // store old zoom level and calculate new one
                var oldZoom = self._currentZoomLevel;
                var i;
                self._setCurrentZoomLevel();
                console.log(oldZoom, self._currentZoomLevel);
                if (oldZoom !== self._currentZoomLevel) {
                    // need to display different group of markers
                    // hide old
                    if (oldZoom === self._baseZoom) {
                        // hide base markers
                        for (i = 0; i < self._baseMarkers.length; i++) {
                            self._map.removeLayer(self._baseMarkers[i]);
                        }
                    }
                    else {
                        // hide composite markers
                        for (var key in self._zoomLevels['' + oldZoom].markers) {
                            self._map.removeLayer(self._zoomLevels['' + oldZoom].markers[key].marker);
                        }
                    }
                    // display new
                    if (self._zoomLevels['' + self._currentZoomLevel]) {
                        // composite markers
                        for (var key in self._zoomLevels['' + self._currentZoomLevel].markers) {
                            self._zoomLevels['' + self._currentZoomLevel].markers[key].marker.addTo(self._map);
                        }
                    }
                    else {
                        // base markers
                        for (i = 0; i < self._baseMarkers.length; i++) {
                            self._baseMarkers[i].addTo(self._map);
                        }
                    }
                }
            }
            this._map.on('zoomend', rerender);
        };
        /*** stop listen for map's zoom change */
        MarkerAggregator.prototype.stop = function () {
        };
        return MarkerAggregator;
    })();
    // inject
    context.MarkerAggregator = MarkerAggregator;
}(this));

//# sourceMappingURL=maps/markerAggregator.js.map

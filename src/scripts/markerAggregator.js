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
            this._compositeMarkers = [];
            // coords, comments, etc. of base markers
            this._baseMarkersData = [];
            // coords, comments, etc. of composite markers
            this._compositeMarkersData = [];
            // zoom level up to which (>=) base markers are displayed on the map
            this._baseZoom = 15;
            // zoom level below which (<=) new markera are not created 
            this._minZoom = 7;
            // how much should zoom change to trigger markers change
            this._zoomStep = 2;
            // size of the window to combine base markers at _baseZoom in degrees
            this._baseWindowSize = 0.005;
            // refference center of the aggregator, calculated at first rendering
            this._center = null;
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
                    windowSize: this._baseWindowSize * Math.pow(1.5, this._baseZoom - j),
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
        /*** add new leaflet marker to the aggregator
         * @marker - leaflet marker object
         * @return - number of base markers if successful, -1 if not
        */
        MarkerAggregator.prototype.addMarker = function (coords) {
            var self = this;
            // var marker;	// leaflet marker
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
            // create record?
            this._baseMarkersData.push({
                lat: coords[0],
                lng: coords[1],
                id: ++this._id
            });
            // calculate center using the first one
            if (!this._center && this._baseMarkersData.length) {
                this._center = {
                    lat: localCoords.lat,
                    lng: localCoords.lng
                };
            }
            // create base marker
            var baseMarkerRef = L.marker([localCoords.lat, localCoords.lng]);
            this._baseMarkers.push(baseMarkerRef);
            console.log(baseMarkerRef);
            // apply changes to corresponding composite markers
            var latIndex, lngIndex;
            for (var j = this._baseZoom - this._zoomStep; j >= this._minZoom; j -= this._zoomStep) {
                // calculate composite marker's position
                latIndex = Math.floor((coords.lat - this._center.lat) / this._zoomLevels['' + j].windowSize);
                lngIndex = Math.floor((coords.lat - this._center.lat) / this._zoomLevels['' + j].windowSize);
                if (!this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex] ||
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].counter === 0) {
                    // first marker in this cell
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex] = {
                        marker: L.marker([baseMarkerRef.getLatLng().lat, baseMarkerRef.getLatLng().lng]),
                        counter: 1,
                        baseMarkers: [baseMarkerRef]
                    };
                }
                else {
                    var counter = this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].counter;
                    var oldLat = this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker.getLatLng().lat, oldLng = this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker.getLatLng().lng;
                    self._map.removeLayer(this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker);
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].marker =
                        L.marker([(baseMarkerRef.getLatLng().lat + oldLat * counter) / (counter + 1),
                            (baseMarkerRef.getLatLng().lng + oldLng * counter) / (counter + 1)
                        ]);
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].baseMarkers.push(baseMarkerRef);
                    this._zoomLevels['' + j].markers[latIndex + '|' + lngIndex].counter++;
                }
            }
            // marker.addTo(this._map);
            // add new marker
            // this._baseMarkers.push(marker);
            // return counter
            return this._id;
        };
        /*** return base markers */
        MarkerAggregator.prototype.getBaseMarkers = function () {
            return this._baseMarkersData;
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

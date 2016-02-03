/// <reference path="markerAggregator.d.ts" />
(function (context) {
    'use strict';
    var MarkerAggregator = (function () {
        function MarkerAggregator(map, options) {
            this._private = {
                // leaflet base markers
                _baseMarkers: [],
                // zoom level up to which (<) base markers are displayed on the map
                _baseZoom: 10,
                // size of the window to combine base markers at _baseZoom in degrees
                _windowSize: 0.01
            };
            if (options) {
                this._private._baseZoom = options.baseZoom || this._private._baseZoom;
                this._private._windowSize = options.windowSize || this._private._windowSize;
            }
        }
        /*** add new leaflet marker to the aggregator
         * @marker - leaflet marker object
         * @return - number of base markers if successful, -1 if not
        */
        MarkerAggregator.prototype.addMarker = function (coords) {
            var marker; // leaflet marker
            if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                marker = L.marker([coords[0], coords[1]]);
            }
            else if ((coords.lat || coords.lat === 0) && (coords.lng || coords.lng === 0)) {
                marker = L.marker([coords.lat, coords.lng]);
            }
            else {
                return -1;
            }
            marker.addTo(map);
            // add new marker
            this._private._baseMarkers.push(marker);
            // return counter
            return this._private._baseMarkers.length;
        };
        /*** return base markers */
        MarkerAggregator.prototype.getBaseMarkers = function () {
            return this._private._baseMarkers;
        };
        return MarkerAggregator;
    })();
    // inject
    context.MarkerAggregator = MarkerAggregator;
}(this));

//# sourceMappingURL=maps/markerAggregator.js.map

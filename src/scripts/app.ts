/// <reference path="others.d.ts" />
/// <reference path="markerAggregator.ts" />
/* global L */
/* global document */
/* global XMLHttpRequest */
var map: any;

var test: IAggregator;

(function(){
'use strict';

    // calculate markers center
    var avgLat = 0, avgLng = 0;
    for (var i=0; i<points.length; i++) {
        avgLat += +points[i].lat;
        avgLng += +points[i].lng;
    }
    avgLat /= points.length;
    avgLng /= points.length;
    
    document.addEventListener('DOMContentLoaded', function () {
    
        // display map
        map = L.map('map').setView([avgLat, avgLng], 12);
        L.tileLayer.provider('OpenStreetMap.HOT').addTo(map);
         
        // instantiate aggregator
        test = new MarkerAggregator(map, {});
        
        for (var i=0; i<points.length; i++) {  
            test.addMarker({lat: points[i].lat, lng: points[i].lng});
        } 
            
// console.log(test.getBaseMarkers());
    
    });
})();
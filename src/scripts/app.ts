/// <reference path="others.d.ts" />
/// <reference path="markerAggregator.ts" />
/// <reference path="./D2tree.ts" />
/* global L, document, XMLHttpRequest */
import D2tree from './D2tree.ts';
import MarkerAggregator from './markerAggregator.ts';

var map: any;
var test: IAggregator;

(function(context){
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
        
        var tree:ID2Tree = new D2tree({lat: points[0].lat, lng: points[0].lng},
                            [L.marker([points[0].lat, points[0].lng]),0]);

        for (var i=1; i<points.length; i++) {
            test.addMarker({lat: points[i].lat, lng: points[i].lng});
            // tree.addLeaf({lat: points[i].lat, lng: points[i].lng}, [L.marker([points[i].lat, points[i].lng]),i]);
            // L.marker([points[i].lat, points[i].lng]).bindLabel(''+i, { noHide: true }).addTo(map);
        }
        
        var q = test.getBaseMarkers();
        console.log(q);
        var j=0;
        // document.addEventListener('click', () => {
        //     if (j<q.length) {
        //         if (q[j]) q[j].getValue()[0].addTo(map);
        //     } else {alert('q');}
        //     j++;
        // })
        for (var j=0; j<q.length; j++) {
            // if (q[j]) console.log(q[j].getValue()[0]);
            if (q[j]) q[j].getValue().addTo(map);
        } 
        
        // test.start();
            
// console.log(test.getBaseMarkers());

        context.tree = tree;   
        context.test = test; 
    });
})(window);
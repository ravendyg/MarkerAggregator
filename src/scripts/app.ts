/// <reference path="others.d.ts" />
/// <reference path="markerAggregator.ts" />
/* global L */
/* global document */
/* global XMLHttpRequest */
var map: any;
var points: any;

var test: IAggregator;

(function(){
'use strict';

    var url = 'http://excur.info/data/?city=новосибирск&cur=R01235';
    
    function ajaxGet (address: string, callback: Function): void {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', address, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    callback(xmlhttp);
                }
            }
        };
        xmlhttp.send(null);
    }
    
    document.addEventListener('DOMContentLoaded', function () {
    
        // display map
        map = L.map('map').setView([54.8591682,83.0328811], 12);
        L.tileLayer.provider('OpenStreetMap.HOT').addTo(map);
        
        (function(){
            // this part can be anything, just should produce some coordinates for test markers 
            var promise = new Promise ( (resolve, reject) => {
                ajaxGet(url, res => {
                    if (res.responseText === 'call later') {
                        setTimeout(() => {
                            ajaxGet(url, function (res) {
                                points = JSON.parse(res.responseText).banks;
                                resolve();
                            });    
                        }, 5000);  
                    } else {
                        points = JSON.parse(res.responseText).banks;
                        resolve();  
                    }
                });            
            });
            return promise;        
        })().then( () => {            
            // instantiate aggregator
            test = new MarkerAggregator(map, {});
            
            for (var i=0; i<points.length; i++) {  
              test.addMarker({lat: points[i].lat, lng: points[i].lng});
            } 
            
console.log(test.getBaseMarkers());
        });
    
    });
})();
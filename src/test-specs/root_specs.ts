/// <reference path="./../../typings/tsd.d.ts" />

import {D2tree} from './../scripts/D2tree.ts';

describe(`test Kd-tree implementation with abstract data and coords: []`, () => {
    var testTree: ID2Tree<{m: number}>;
    var testPoints: {cr: number [], data: {m: number}} [] = [
        {cr: [7,6], data: {m: 1}},
        {cr: [11,5], data: {m: 2}},
        {cr: [5,8], data: {m: 3}},
        {cr: [3,1], data: {m: 4}},
        {cr: [2,7], data: {m: 5}},
        {cr: [6,10], data: {m: 6}},
        {cr: [8,4], data: {m: 7}},
        {cr: [17,13], data: {m: 8}},
        {cr: [15,11], data: {m: 9}},
        {cr: [9,3], data: {m: 10}}
    ];
    
    beforeEach(() => {
        testTree = new D2tree(testPoints[0].cr, testPoints[0].data);
        for (var i=1; i < testPoints.length; i++) {
            testTree.addLeaf(testPoints[i].cr, testPoints[i].data);
        }
        console.log(testTree);    
    });
    
    it(`should contain all data added and only them`, () => {
        // look for each element passed in and subtract 1 from the number of nodes on the tree
        // should be 0
        var list = testTree.traverse();
        var sum = list.length;
        for (var k=0; k < testPoints.length; k++) {
            sum -= list.filter( e => e.m === testPoints[k].data.m).length; 
        }
        expect(sum).toBe(0);
    });
    
    it(`closest to [6,3] should be m: 7`, () => {
        expect(testTree.findNearest({lat: 6, lng: 3}).content.m).toBe(7);
    });
    it(`closest to [5,3] should be m: 4`, () => {
        expect(testTree.findNearest({lat: 5, lng: 3}).content.m).toBe(4);
    });
    it(`closest to [7,9] should be m: 6`, () => {
        expect(testTree.findNearest({lat: 7, lng: 9}).content.m).toBe(6);
    });    
});

describe(`test Kd-tree implementation with real data and coords: {}`, () => {
    var testTree: ID2Tree<{m: number}>;
    var testPoints: {cr: {lat: number, lng: number}, data: {m: number}} [] = [
        {cr: {lat: 55.03916299999999, lng: 82.90560699999999}, data: {m: 1}},
        {cr: {lat: 55.065839, lng: 82.903183}, data: {m: 2}},
        {cr: {lat: 54.9931195, lng: 82.8970283}, data: {m: 3}},
        {cr: {lat: 54.8667059, lng: 83.08081585}, data: {m: 4}},
        {cr: {lat: 54.9817925,lng: 82.86851899999999}, data: {m: 6}},
        {cr: {lat: 55.078459,lng: 82.9602}, data: {m: 7}},
        // {cr: {lat: 55.0694317,lng: 82.9491895}, data: {m: 8}}
    ];
    
    testTree = new D2tree(testPoints[0].cr, testPoints[0].data);
    for (var i=1; i < testPoints.length; i++) {
        testTree.addLeaf(testPoints[i].cr, testPoints[i].data);
    }
    
    it(`should contain all data added and only them`, () => {
        // look for each element passed in and subtract 1 from the number of nodes on the tree
        // should be 0
        var list = testTree.traverse();
        var sum = list.length;
        for (var k=0; k < testPoints.length; k++) {
            sum -= list.filter( e => e.m === testPoints[k].data.m).length; 
        }
        expect(sum).toBe(0);
    });
    
    
    // don't use beforeEach because always have to comment out different parts 
    it(`closest to {lat: 55.0694317,lng: 82.9491895} should be m: 7`, () => {
        testPoints = [
            {cr: {lat: 55.03916299999999, lng: 82.90560699999999}, data: {m: 1}},
            {cr: {lat: 55.065839, lng: 82.903183}, data: {m: 2}},
            {cr: {lat: 54.9931195, lng: 82.8970283}, data: {m: 3}},
            {cr: {lat: 54.8667059, lng: 83.08081585}, data: {m: 4}},
            {cr: {lat: 54.9817925,lng: 82.86851899999999}, data: {m: 6}},
            {cr: {lat: 55.078459,lng: 82.9602}, data: {m: 7}},
            // {cr: {lat: 55.0694317,lng: 82.9491895}, data: {m: 8}}
        ];
        testTree = new D2tree(testPoints[0].cr, testPoints[0].data);
        for (var i=1; i < testPoints.length; i++) {
            testTree.addLeaf(testPoints[i].cr, testPoints[i].data);
        }
        
        expect(testTree.findNearest({lat: 55.0694317,lng: 82.9491895}).content.m).toBe(7);
    });
    
    it(`closest to {lat: 54.8667059, lng: 83.08081585} should be m: 3`, () => {
        testPoints = [
            {cr: {lat: 55.03916299999999, lng: 82.90560699999999}, data: {m: 1}},
            {cr: {lat: 55.065839, lng: 82.903183}, data: {m: 2}},
            {cr: {lat: 54.9931195, lng: 82.8970283}, data: {m: 3}},
            // {cr: {lat: 54.8667059, lng: 83.08081585}, data: {m: 4}},
            {cr: {lat: 55.078459,lng: 82.9602}, data: {m: 6}},
            {cr: {lat: 54.9817925,lng: 82.86851899999999}, data: {m: 7}},
            {cr: {lat: 55.0694317,lng: 82.9491895}, data: {m: 8}}
        ];
        testTree = new D2tree(testPoints[0].cr, testPoints[0].data);
        for (var i=1; i < testPoints.length; i++) {
            testTree.addLeaf(testPoints[i].cr, testPoints[i].data);
        }

        expect(testTree.findNearest({lat: 54.8667059, lng: 83.08081585}).content.m).toBe(3);
    });
    
});















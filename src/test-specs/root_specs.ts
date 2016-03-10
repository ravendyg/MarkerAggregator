/// <reference path="./../../typings/tsd.d.ts" />

import {D2tree} from './../scripts/D2tree.ts';

describe(`test Kd-tree implementation`, () => {
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
        
})
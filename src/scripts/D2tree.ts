/// <reference path="./../../typings/tsd.d.ts" />

class Node implements INode {
    private _latKey: number;
    private _lngKey: number;
    // leaflet marker and any data that need to be passed through
    private _content: any;
    private _leftNode: Node;
    private _rightNode: Node;
    private _color: boolean;
    
    constructor (coords: any, content: any) {
        // coords either Ilatlng or [lat, lng]
        // read coordinates 
        if (Array.isArray(coords) && coords.length >= 2
            && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            this._latKey = coords[0];
            this._lngKey = coords[1]; 
        } else if ((coords.lat || coords.lat === 0) && (coords.lng || coords.lng === 0)) {
            this._latKey = coords.lat;
            this._lngKey = coords.lng; 
        } else {
            console.error('D2tree - Node: wrong node coordinates');
            this._latKey = 0;
            this._lngKey = 0;
        }
        
        // no branches
        this._leftNode = null;
        this._rightNode = null;
        
        // by default red
        this._color = true;
        
        this._content = content;
    }
    
    public setLeftNode (node: Node): INode {
        this._leftNode = node;
        return this._leftNode;
    }
    public setRightNode (node: Node): INode {
        this._rightNode = node;
        return this._rightNode;
    }   
    public getLeftNode (): INode {
        return this._leftNode;
    }
    public getRightNode (): INode {
        return this._rightNode;
    }
    public setColor (color: boolean) {
        if (color) this._color = true;
        else this._color = false;
    }
    public getColor (): boolean {
        return this._color;
    }
    
    public getLat (): number {
        return this._latKey;
    }
    public getLng (): number {
        return this._lngKey;
    }
    
    public getContent <T>(): T {
        return this._content;
    }
}

export class D2tree <T> implements ID2Tree<T> {
    private _root: Node;
    
    constructor (coords: any, content: T) {
        this._root = new Node(coords, content);
    }
    
    private _place (parentNode: any, childNode: any) {
        var method: string;
        var direction: string;
        
        if (parentNode.getColor()) {
            // RED - lng
            method = 'getLng';            
        } else {
            // BLACK - lat
            method = 'getLat';
        }
        
        if (parentNode[method]() < childNode[method]()) {
            // new to right
            direction = 'RightNode';
        } else {
            // new to left
            direction = 'LeftNode';
        }
        
        if (!parentNode[`get${direction}`]()) {
            // branch is empty
            parentNode[`set${direction}`](childNode);
            parentNode[`get${direction}`]().setColor(!parentNode.getColor());
        } else {
            this._place(parentNode[`get${direction}`](), childNode);
        }
    }
    
    private _calculateDistance (marker: INode, coords: PointType): number {
        // if this branch doesn't exist
        if (!marker) return Infinity;
        // else calculate
        return Math.sqrt(
            Math.pow(marker.getLat() - coords.lat, 2) + 
            Math.pow(marker.getLng() - coords.lng, 2)
        );
    }
    
    public addLeaf (coords: any, content: any): void {
        // create new Node
        var newLeaf = new Node(coords, content);
        // and insert it
        this._place(this._root, newLeaf);
    }
    
    /** return array of content! of all nodes in top to bottom, left to right order */
    public traverse <T>(): T [] {
        var output: INode [];
        output = [this._root];
        // this._root.getValue()[0].bindLabel(this._root.getValue()[1]+': -1', { noHide: true });
        
        var i = 0;
        var tempNode: INode;
        while (i < output.length) {
            if (output[i]) {
                tempNode = output[i].getLeftNode();
                if (tempNode) {
                    // tempNode.getValue()[0].bindLabel(tempNode.getValue()[1]+': '+i, { noHide: true });
                    output.push(tempNode);
                } 
                
                tempNode = output[i].getRightNode();
                if (tempNode) {
                    // tempNode.getValue()[0].bindLabel(tempNode.getValue()[1]+': '+i, { noHide: true });
                    output.push(tempNode);
                }
            }
            i++;   
        }
        
        return output.map(e => e.getContent());
    }
    
    public getRoot (): Node {
        return this._root;
    }
    
    /*** find nearest node to the specified point
     * @return : {content: it's content, dist: distance  in [deg]}
    */
    public findNearest (coords: PointType): NearestType {
        var self = this;
        var tempLeader: INode;
        var beingChecked: INode = this._root;
        var notChecked: INode [] = [];
        var now: string, later: string;
        var dist = {
            Left: -1,
            Right: -1,
            leader: -1
        };
        
        dist.leader = this._calculateDistance(beingChecked, coords);
        tempLeader = beingChecked;
        
        var searchDeeper = () => {

            dist.Left = self._calculateDistance(beingChecked.getLeftNode(), coords);
            dist.Right = self._calculateDistance(beingChecked.getRightNode(), coords);
            if (dist.Left < dist.Right) {
                // now = 'Left';
                // later = 'Right';
                
                if (dist.Left < dist.leader) {
                    dist.leader = dist.Left;
                    tempLeader = beingChecked.getLeftNode();
                } else if (beingChecked && beingChecked.getRightNode()) {
                    // haven't got closer -> possibility that there is one closer on the other branch; if it's not null
                    notChecked.push(beingChecked.getRightNode());
                }
                // move deeper
                beingChecked = beingChecked.getLeftNode(); 
            } else {
                // now = 'Right';
                // later = 'Left';
                
                if (dist.Right < dist.leader) {
                    dist.leader = dist.Right;
                    tempLeader = beingChecked.getRightNode();
                } else if (beingChecked && beingChecked.getLeftNode()) {
                    // haven't got closer -> possibility that there is one closer on the other branch; if it's not null
                    notChecked.push(beingChecked.getLeftNode());
                }
                // move deeper
                beingChecked = beingChecked.getRightNode();
            }
            
            // if (dist[now] < dist.leader) {
            //     dist.leader = dist[now];
            //     tempLeader = beingChecked[`get${now}Node`]();
            // } else if (beingChecked && beingChecked[`get${later}Node`]()) {
            //     // haven't got closer -> possibility that there is one closer on the other branch; if it's not null
            //     notChecked.push(beingChecked[`get${later}Node`]());
            // }
            // // move deeper
            // beingChecked = beingChecked[`get${now}Node`]();
        }
        
        // iterate while there is where to go deeper or where to return on the other branches
        while (beingChecked || notChecked.length) {
            if (beingChecked) searchDeeper();
            else beingChecked = notChecked.pop();
        }
        
        return {
            dist: dist.leader,
            content: tempLeader.getContent()
        }
        
        // test._baseMarkersTree._calculateDistance({lat:54.9830,lng:82.8722},0.001)
    }
}
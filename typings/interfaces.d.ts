interface IAggregatorOptions {
	baseZoom?: number,
	minZoom?: number,
	baseWindowSize?: number,
	zoomStep?: number
}

interface IAggregator {
	addMarker (markerCoords: any): number;
	getBaseMarkers (): any [];
	start (): void;
	stop (): void;
}

interface IMap {
	getZoom (): number;
	on (event: string, callback: () => void, context: any): any;
    off (event: string, callback: () => void, context: any): any;
	removeLayer (layer: any): any;
}

interface INode {
    setLeftNode (node: INode): INode;
    setRightNode (node: INode): INode;
    getLeftNode (): INode;
    getRightNode (): INode;
    setColor (color: boolean): any;
    getColor (): boolean;
    getLat (): number;
    getLng (): number;
    getContent (): any; 
}

interface ID2Tree <T> {
    // new (coords: any, marker: any): ID2Tree;
    addLeaf (coords: any, content: any): void;
    traverse (): T [];
    getRoot (): INode;
    findNearest (coords: PointType): any;
}

interface ILMarker {
    getLatLng: () => PointType;
    addTo: (map: IMap) => ILMarker;
    m?: number;
}
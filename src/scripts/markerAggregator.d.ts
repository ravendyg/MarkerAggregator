// point on a map
interface Ilatlng {
	lat: number,	// degrees
	lng: number,	// degrees
	alt?: number	// meters
}

interface IAggregatorOptions {
	baseZoom?: number,
	minZoom?: number,
	baseWindowSize?: number,
	zoomStep?: number
}

interface IAggregator {
	addMarker (markerCoords: any): number;
	getBaseMarkers (): any [];
	// start (): void;
	// stop (): void;
}

interface IMap {
	getZoom (): number,
	on (event: string, callback: () => void),
	removeLayer (layer: any)
}

declare var MarkerAggregator: {
	new (map: any, options: IAggregatorOptions): IAggregator;
}

interface INode {
    setLeftNode (node: INode): INode;
    setRightNode (node: INode): INode;
    getLeftNode (): INode;
    getRightNode (): INode;
    setColor (color: boolean);
    getColor (): boolean;
    getLat (): number;
    getLng (): number;
    getValue (): any; 
}

interface ID2Tree {
    addLeaf (coords: any, value: any): void;
    traverse (): INode [];
    getRoot (): INode;
    findNearest (coords: Ilatlng, radius: number): markerContent;
}

declare type markerContent = any;

interface IMarker {
    aId?: number;
}
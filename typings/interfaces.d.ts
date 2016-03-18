interface IAggregatorOptions {
	baseZoom?: number,
	minZoom?: number,
	baseWindowSize?: number,
	zoomStep?: number
}

interface IAggregator {
	addNewMarker (markerCoords: any, markerData: MarkerDataType): number;
	getBaseMarkers (): any [];
    filter (newFilter: FilterType): void;
	start (): void;
	stop (): void;
}

interface IMap {
	getZoom (): number;
    zoomIn (delta?: number): void;
    setView (point: PointType, zoom?: number): void;
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
    addLeaf (coords: any, content: T): void;
    traverse (): T [];
    getRoot (): INode;
    findNearest (coords: PointType): NearestType<T>;
}

interface ILMarker {
    getLatLng: () => PointType;
    addTo: (map: IMap) => ILMarker;
    setIcon: (icon: any) => ILMarker;
    bindPopup: (text: any) => ILMarker;
    bindLabel: (text: any, options?: {noHide?: boolean}) => ILMarker;
    on (event: string, callback: () => void, context: any): ILMarker;
    off (event: string, callback: () => void, context: any): ILMarker;
    m?: number;
}
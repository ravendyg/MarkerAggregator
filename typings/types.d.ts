declare type MarkerContentType = {
    marker: any;
};

// point on a map
declare type PointType = {
	lat: number,	// degrees
	lng: number,	// degrees
	alt?: number	// meters
}

declare type ZoomLevelType = {
    compositeMarkersTree: ID2Tree<MarkerType>,
    // markers: any,
    windowSize: number
}

declare type NearestType = {
    content: any,
    dist: number
}

declare type MarkerType = {
    marker: ILMarker,
    aId?: number
}
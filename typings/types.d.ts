declare type markerContent = any;

// point on a map
declare type PointType = {
	lat: number,	// degrees
	lng: number,	// degrees
	alt?: number	// meters
}

declare type ZoomLevelType = {
    compositeMarkersTree: ID2Tree,
    markers: any,
    windowSize: number
}
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

declare type NearestType<T>= {
    content: T,
    dist: number
}

declare type MarkerType = {
    marker: ILMarker,
    refs: MarkerType [],
    aId?: number,
    max?: number,
    min?: number
}
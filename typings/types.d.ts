declare type MarkerContentType = {
    marker: any;
};

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
    buy?: number,
    sell?: number,
    bankName?: string,
    tel?: string,
    info?: string,
    com?: string,
    wh?: string,
    address?: string
}

declare type MarkerDataType = {
    buy?: number,
    sell?: number,
    bankName?: string,
    tel?: string,
    info?: string,
    com?: string,
    wh?: string,
    address?: string
}

declare type FilterType = {
    buyVal: number,
    sellVal: number,
    rad: boolean,
    center: PointType,
    radVal: number
}

// point on a map
declare type PointType = {
	lat: number,	// degrees
	lng: number,	// degrees
	alt?: number,	// meters
    distanceTo?: (where: PointType) => number;
}
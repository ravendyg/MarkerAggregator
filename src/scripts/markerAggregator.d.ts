// point on a map
interface Ilatlng {
	lat: number,	// degrees
	lng: number,	// degrees
	alt?: number	// meters
}

interface IAggregatorOptions {
	baseZoom?: number,
	baseWindowSize?: number,
	zoomStep?: number
}

interface IAggregator {
	addMarker (marker: any): number;
	getBaseMarkers (): any [];
}

declare var MarkerAggregator: {
	new (map: any, options: IAggregatorOptions): IAggregator;
}
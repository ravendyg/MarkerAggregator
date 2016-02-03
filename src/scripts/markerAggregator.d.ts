// point on a map
interface Ilatlng {
	lat: number,	// degrees
	lng: number,	// degrees
	alt?: number	// meters
}

interface IAggregatorOptions {
	baseZoom?: number,
	windowSize?: number
}

interface IAggregator {
	addMarker (marker: any): number;
	getBaseMarkers (): any [];
}

declare var MarkerAggregator: IAggregator;
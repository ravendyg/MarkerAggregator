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
	addMarker (marker: any): number;
	getBaseMarkers (): any [];
	start (): void;
	stop (): void;
}

interface IMap {
	getZoom (): number,
	on (event: string, callback: () => void),
	removeLayer (layer: any)
}

declare var MarkerAggregator: {
	new (map: any, options: IAggregatorOptions): IAggregator;
}
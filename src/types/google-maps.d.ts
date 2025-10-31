/// <reference types="@types/google.maps" />

// Extend google.maps namespace for additional types
declare namespace google.maps {
  namespace directions {
    interface DirectionsService {
      route(request: DirectionsRequest): Promise<DirectionsResult>;
    }
    
    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: string;
      travelMode: TravelMode;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
    }
    
    interface DirectionsRenderer {
      new (): DirectionsRenderer;
      setMap(map: Map | null): void;
      setDirections(directions: DirectionsResult): void;
    }
  }
}



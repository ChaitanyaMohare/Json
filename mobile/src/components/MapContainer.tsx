import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Incident, NearbyService, Coordinates } from '../types';
import { MapLayersState } from './MapFilterSheet';
import { InteractiveMap } from './InteractiveMap';

interface MapContainerProps {
  currentLocation?: Coordinates;
  currentHeading?: number | null;
  recenterTrigger?: number;
  incidents: Incident[];
  services: NearbyService[];
  layers: MapLayersState;
  onSelectIncident: (inc: Incident) => void;
  onSelectService: (srv: NearbyService) => void;
  selectedIncidentId?: string | null;
  selectedServiceId?: string | null;
  showRoutePolyline?: boolean;
  selectedRouteType?: 'Fastest' | 'Recommended' | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  currentLocation = { latitude: 28.6139, longitude: 77.209 },
  currentHeading = null,
  recenterTrigger = 0,
  incidents,
  services,
  layers,
  onSelectIncident,
  onSelectService,
}) => {
  return (
    <View style={styles.mapContainer}>
      <InteractiveMap
        currentLocation={currentLocation}
        currentHeading={currentHeading}
        recenterTrigger={recenterTrigger}
        incidents={incidents}
        services={services}
        layers={layers}
        onSelectIncident={onSelectIncident}
        onSelectService={onSelectService}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
});

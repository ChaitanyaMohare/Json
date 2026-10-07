import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Coordinates,
  DestinationItem,
  RouteOption,
  TravelMode,
  IncidentType,
  Report,
  SavedPlace,
  MapLayersState,
  UserProfile,
  GeoTagMetadata,
} from '../types';
import {
  mockRoutes,
  DEFAULT_COORDS,
  DEFAULT_USER_PROFILE,
} from '../data/mockData';
import { LocationService } from '../services/locationService';
import { ReportService } from '../services/reportService';
import { DirectionsService } from '../services/directionsService';

const STORAGE_KEY_SAVED_PLACES = '@waysure_saved_places_v2';
const STORAGE_KEY_USER_PROFILE = '@waysure_user_profile_v2';

export interface AppContextType {
  // Location
  currentLocation: Coordinates;
  currentHeading: number | null;
  locationLabel: string;
  locationPermissionGranted: boolean;
  requestLocation: () => Promise<void>;

  // Destination & Routes
  selectedDestination: DestinationItem;
  setSelectedDestination: (dest: DestinationItem) => void;
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
  availableRoutes: RouteOption[];
  selectedRoute: RouteOption;
  setSelectedRoute: (route: RouteOption) => void;
  recalculateRoutes: (
    dest?: DestinationItem,
    mode?: TravelMode,
    origin?: Coordinates
  ) => Promise<void>;

  // Navigation State
  isNavigating: boolean;
  startNavigation: (route?: RouteOption) => void;
  endNavigation: () => void;
  navigationMuted: boolean;
  setNavigationMuted: (muted: boolean) => void;
  currentSpeed: number;

  // Modals & Sheets
  incidentAlertVisible: boolean;
  setIncidentAlertVisible: (visible: boolean) => void;
  alternativeRouteVisible: boolean;
  setAlternativeRouteVisible: (visible: boolean) => void;
  reportQuickSheetVisible: boolean;
  setReportQuickSheetVisible: (visible: boolean) => void;
  selectedIncidentType: IncidentType;
  setSelectedIncidentType: (type: IncidentType) => void;

  // Map Layers
  mapLayers: MapLayersState;
  toggleMapLayer: (layer: keyof MapLayersState) => void;

  // Reports
  submittedReports: Report[];
  submitNewReport: (
    incidentType: IncidentType,
    description: string,
    photoUri: string | null,
    locationLabel: string,
    customCoords?: Coordinates,
    geoTag?: GeoTagMetadata | null
  ) => Promise<Report>;

  // Saved Places
  savedPlaces: SavedPlace[];
  savePlace: (place: SavedPlace) => void;

  // Side Menu & Sub-screens
  sideMenuOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
  activeDrawerModal:
    | null
    | 'saved_places'
    | 'offline_maps'
    | 'safety_settings'
    | 'emergency_contacts'
    | 'your_reports'
    | 'app_settings'
    | 'help';
  setActiveDrawerModal: (
    modal:
      | null
      | 'saved_places'
      | 'offline_maps'
      | 'safety_settings'
      | 'emergency_contacts'
      | 'your_reports'
      | 'app_settings'
      | 'help'
  ) => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const defaultLayers: MapLayersState = {
  incidents: true,
  hospitals: true,
  police: true,
  fuel: true,
  cng: true,
  garages: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Location state
  const [currentLocation, setCurrentLocation] =
    useState<Coordinates>(DEFAULT_COORDS);
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('Locating...');
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  // Destination & Route state
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationItem>({
      id: 'dest-initial',
      name: 'Select Destination',
      state: 'Destination',
      address: 'Choose your destination',
    });
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [availableRoutes, setAvailableRoutes] =
    useState<RouteOption[]>(mockRoutes);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(
    mockRoutes[0]
  );

  // Navigation status
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navigationMuted, setNavigationMuted] = useState<boolean>(false);

  // Sheet & alert visibility
  const [incidentAlertVisible, setIncidentAlertVisible] =
    useState<boolean>(false);
  const [alternativeRouteVisible, setAlternativeRouteVisible] =
    useState<boolean>(false);
  const [reportQuickSheetVisible, setReportQuickSheetVisible] =
    useState<boolean>(false);
  const [selectedIncidentType, setSelectedIncidentType] =
    useState<IncidentType>('accident');

  // Map layers
  const [mapLayers, setMapLayers] = useState<MapLayersState>(defaultLayers);

  // Reports (clean initial state)
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);

  // Saved Places (clean initial state)
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

  // Drawer / Side Menu
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const [activeDrawerModal, setActiveDrawerModal] = useState<
    | null
    | 'saved_places'
    | 'offline_maps'
    | 'safety_settings'
    | 'emergency_contacts'
    | 'your_reports'
    | 'app_settings'
    | 'help'
  >(null);

  // User Profile State
  const [userProfile, setUserProfile] =
    useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Init location, reports, and profile
  useEffect(() => {
    requestLocation();
    loadReports();
    loadSavedPlaces();
    loadUserProfile();
  }, []);

  const requestLocation = async () => {
    try {
      const locResult = await LocationService.getCurrentLocation();
      setLocationPermissionGranted(locResult.granted);
      setCurrentLocation(locResult.coordinates);
      if (locResult.label) {
        setLocationLabel(locResult.label);
      }
      if (locResult.speedKmh) {
        setCurrentSpeed(locResult.speedKmh);
      }
      if (locResult.heading !== undefined && locResult.heading !== null) {
        setCurrentHeading(locResult.heading);
      }

      if (locResult.granted) {
        LocationService.watchLocation((coords, speed, heading) => {
          setCurrentLocation(coords);
          if (speed !== undefined && speed >= 0) setCurrentSpeed(speed);
          if (heading !== undefined && heading !== null) setCurrentHeading(heading);
        });
      }
    } catch (e) {
      console.warn('Failed in requestLocation:', e);
    }
  };

  const loadReports = async () => {
    const reps = await ReportService.getReports();
    setSubmittedReports(reps);
  };

  const loadSavedPlaces = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SAVED_PLACES);
      if (data) {
        setSavedPlaces(JSON.parse(data));
      } else {
        setSavedPlaces([]);
      }
    } catch {
      setSavedPlaces([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (data) {
        setUserProfile((prev) => ({ ...prev, ...JSON.parse(data) }));
      }
    } catch (e) {
      console.warn('Failed to load user profile:', e);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      setUserProfile((prev) => {
        const next = { ...prev, ...updates };
        AsyncStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(next)).catch(() => {});
        return next;
      });
    } catch (e) {
      console.warn('Failed to update user profile:', e);
    }
  };

  const recalculateRoutes = async (
    dest: DestinationItem = selectedDestination,
    mode: TravelMode = travelMode,
    originCoords: Coordinates = currentLocation
  ) => {
    if (dest.coordinates) {
      const routes = await DirectionsService.calculateRoutes(
        originCoords,
        dest.coordinates,
        mode
      );
      setAvailableRoutes(routes);
      if (routes.length > 0) {
        setSelectedRoute(routes[0]);
      }
    }
  };

  const startNavigation = (route?: RouteOption) => {
    if (route) {
      setSelectedRoute(route);
    }
    LocationService.resetSpeed();
    setCurrentSpeed(0);
    setIsNavigating(true);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setIncidentAlertVisible(false);
    setAlternativeRouteVisible(false);
    LocationService.resetSpeed();
    setCurrentSpeed(0);
  };

  const toggleMapLayer = (layer: keyof MapLayersState) => {
    setMapLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const submitNewReport = async (
    incidentType: IncidentType,
    description: string,
    photoUri: string | null,
    locLabel: string,
    customCoords?: Coordinates,
    geoTag?: GeoTagMetadata | null
  ): Promise<Report> => {
    const title =
      incidentType === 'accident'
        ? 'Accident'
        : incidentType === 'road_blockage'
        ? 'Road Block'
        : incidentType === 'road_damage'
        ? 'Road Damage'
        : incidentType === 'heavy_traffic'
        ? 'Heavy Traffic'
        : incidentType === 'flooding'
        ? 'Flooding'
        : 'Hazard Alert';

    const targetLat =
      customCoords?.latitude ||
      geoTag?.latitude ||
      currentLocation.latitude;
    const targetLng =
      customCoords?.longitude ||
      geoTag?.longitude ||
      currentLocation.longitude;
    const targetLabel =
      locLabel || geoTag?.addressLabel || locationLabel || 'Live Location';

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      incidentType,
      title,
      description,
      photoUri,
      latitude: targetLat,
      longitude: targetLng,
      locationLabel: targetLabel,
      createdAt: 'Just now',
      status: geoTag ? 'Confirmed' : 'Under Verification',
      reliability: geoTag ? 'High Confidence' : 'Needs Verification',
      supportingReports: geoTag ? 3 : 1,
      geoTag: geoTag || undefined,
    };

    const updated = await ReportService.saveReport(newReport);
    setSubmittedReports(updated);
    return newReport;
  };

  const savePlace = async (place: SavedPlace) => {
    const updated = [place, ...savedPlaces.filter((p) => p.id !== place.id)];
    setSavedPlaces(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SAVED_PLACES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving place to storage:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentLocation,
        currentHeading,
        locationLabel,
        locationPermissionGranted,
        requestLocation,
        selectedDestination,
        setSelectedDestination,
        travelMode,
        setTravelMode,
        availableRoutes,
        selectedRoute,
        setSelectedRoute,
        recalculateRoutes,
        isNavigating,
        startNavigation,
        endNavigation,
        navigationMuted,
        setNavigationMuted,
        currentSpeed,
        incidentAlertVisible,
        setIncidentAlertVisible,
        alternativeRouteVisible,
        setAlternativeRouteVisible,
        reportQuickSheetVisible,
        setReportQuickSheetVisible,
        selectedIncidentType,
        setSelectedIncidentType,
        mapLayers,
        toggleMapLayer,
        submittedReports,
        submitNewReport,
        savedPlaces,
        savePlace,
        sideMenuOpen,
        setSideMenuOpen,
        activeDrawerModal,
        setActiveDrawerModal,
        userProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

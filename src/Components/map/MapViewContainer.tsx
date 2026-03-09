import React, { useRef, useState, useEffect } from "react";
import { View, Alert, ActivityIndicator, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, Region, Polygon, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import axios from "axios";
import styles from "../../styles/MapViewStyle";
import SearchBar from "./SearchBar";
import { Location as LocationType, RouteInfo, Coordinates } from "../../types";
import { GOOGLE_MAPS_API_KEY } from "../../config/maps";
import { decodePolyline } from "../../utils/polyline";
import { calcularDistancia, estaFueraDeRuta } from "../../utils/geoUtils";
import RouteInfoSheet from "./RouteInfoSheet";
import LocationInfoCard from "./LocationInfoCard";
import { IPersonal, IEvent } from "../../types/search.types";
import { findDestinoByDepartamento } from "../../api/locations";

const UTEQ_COORDS: Coordinates = {
    latitude: 20.65398463798,
    longitude: -100.40607234656
};

const UTEQ_POLYGON: Coordinates[] = [
    { latitude: 20.659059966371842, longitude: -100.40269945372627 },
    { latitude: 20.65959992129091,  longitude: -100.406176361857   },
    { latitude: 20.6536731296613,   longitude: -100.40749341000156 },
    { latitude: 20.65308540343216,  longitude: -100.40373974631409 },
    { latitude: 20.659059966371842, longitude: -100.40269945372627 },
];

const OUTER_BOUND: Coordinates[] = [
    { latitude: 21.0,  longitude: -101.0 },
    { latitude: 21.0,  longitude: -99.8  },
    { latitude: 20.2,  longitude: -99.8  },
    { latitude: 20.2,  longitude: -101.0 },
    { latitude: 21.0,  longitude: -101.0 },
];

const INITIAL_REGION: Region = {
    latitude: UTEQ_COORDS.latitude,
    longitude: UTEQ_COORDS.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
};

const MARKER_BLUE = '#1A73E8';

const MapViewContainer = () => {
    const [searchText, setSearchText] = useState("");
    const [allLocations, setAllLocations] = useState<LocationType[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [recalculando, setRecalculando] = useState(false);
    const [showLocationCard, setShowLocationCard] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<IPersonal | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

    const mapRef = useRef<MapView>(null);
    const regionRef = useRef<Region>(INITIAL_REGION);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const lastRecalculationTime = useRef<number>(0);

    useEffect(() => {
        obtenerUbicacionActual();
        loadAllLocations();
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const loadAllLocations = async () => {
        try {
            const { getLocations } = await import('../../api/locations');
            const locs = await getLocations();
            setAllLocations(locs);
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    };

    const obtenerUbicacionActual = async () => {
        try {
            setLoadingLocation(true);

            const USE_TESTING_LOCATION = false;

            if (USE_TESTING_LOCATION) {
                setCurrentLocation(UTEQ_COORDS);
                mapRef.current?.animateToRegion({
                    latitude: UTEQ_COORDS.latitude,
                    longitude: UTEQ_COORDS.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
                setLoadingLocation(false);
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para calcular rutas.');
                setLoadingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coords: Coordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setCurrentLocation(coords);
            mapRef.current?.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);

        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
        } finally {
            setLoadingLocation(false);
        }
    };

    const iniciarTrackingGPS = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 3000,
                    distanceInterval: 10,
                },
                (location) => {
                    const nuevaUbicacion: Coordinates = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    setCurrentLocation(nuevaUbicacion);

                    if (mapRef.current && isNavigating) {
                        mapRef.current.animateToRegion({
                            latitude: nuevaUbicacion.latitude,
                            longitude: nuevaUbicacion.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }, 500);
                    }

                    if (isNavigating && routeCoordinates.length > 0 && selectedLocation) {
                        verificarDesvio(nuevaUbicacion);
                    }
                }
            );
        } catch (error) {
            console.error('Error iniciando tracking:', error);
        }
    };

    const detenerTrackingGPS = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    };

    const verificarDesvio = (ubicacionActual: Coordinates) => {
        const UMBRAL_DESVIO = 50;
        const TIEMPO_MIN_RECALCULO = 10000;

        const ahoraMs = Date.now();
        if (recalculando || ahoraMs - lastRecalculationTime.current < TIEMPO_MIN_RECALCULO) return;

        const fueraDeRuta = estaFueraDeRuta(ubicacionActual, routeCoordinates, UMBRAL_DESVIO);

        if (fueraDeRuta && selectedLocation) {
            Alert.alert('Desvío detectado', 'Recalculando ruta...', [{ text: 'OK' }], { cancelable: true });
            lastRecalculationTime.current = ahoraMs;
            calcularRuta(ubicacionActual, selectedLocation.posicion);
        }
    };

    const calcularRuta = async (origenCoords: Coordinates, destinoCoords: Coordinates) => {
        if (!origenCoords || !destinoCoords) return;

        try {
            setRecalculando(true);

            const params = new URLSearchParams({
                origin: `${origenCoords.latitude},${origenCoords.longitude}`,
                destination: `${destinoCoords.latitude},${destinoCoords.longitude}`,
                key: GOOGLE_MAPS_API_KEY,
                language: 'es',
                alternatives: 'true',
                units: 'metric',
                region: 'mx',
                mode: 'walking',
            });

            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
                { timeout: 10000 }
            );

            if (response.data.status === 'OK' && response.data.routes.length) {
                let bestRoute = response.data.routes[0];

                if (response.data.routes.length > 1) {
                    bestRoute = response.data.routes.reduce((mejor: any, actual: any) => {
                        return actual.legs[0].duration.value < mejor.legs[0].duration.value ? actual : mejor;
                    });
                }

                const leg = bestRoute.legs[0];
                if (!leg || !bestRoute.overview_polyline?.points) throw new Error('Datos de ruta incompletos');

                const points = decodePolyline(bestRoute.overview_polyline.points);
                const validPoints = points.filter(p =>
                    p.latitude && p.longitude &&
                    !isNaN(p.latitude) && !isNaN(p.longitude) &&
                    Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180
                );

                if (validPoints.length === 0) throw new Error('Puntos de ruta inválidos');

                setRouteCoordinates(validPoints);
                setRouteInfo({
                    distancia: leg.distance?.text || 'No disponible',
                    duracion: leg.duration?.text || 'No disponible',
                    distanciaValor: leg.distance?.value || 0,
                    duracionValor: leg.duration?.value || 0,
                });

                mapRef.current?.fitToCoordinates(
                    [origenCoords, ...validPoints.slice(0, 100), destinoCoords],
                    { edgePadding: { top: 120, right: 80, bottom: 320, left: 80 }, animated: true }
                );
            } else {
                Alert.alert("Ruta no encontrada", "No se pudo encontrar una ruta.");
                setRouteCoordinates([]);
                setRouteInfo(null);
            }
        } catch (error: any) {
            console.error("Error al calcular ruta:", error);
            Alert.alert("Error", "No se pudo calcular la ruta: " + error.message);
            setRouteCoordinates([]);
            setRouteInfo(null);
        } finally {
            setRecalculando(false);
        }
    };

    const handleLocationSelect = (location: LocationType) => {
        setSelectedPerson(null);
        setSelectedEvent(null);
        setSelectedLocation(location);
        setShowLocationCard(true);

        mapRef.current?.animateToRegion({
            latitude: location.posicion.latitude,
            longitude: location.posicion.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 500);

        if (currentLocation) {
            calcularRuta(currentLocation, location.posicion);
        } else {
            Alert.alert('Esperando ubicación', 'Obteniendo tu ubicación actual...');
        }
    };

    const handleMarkerPress = (location: LocationType) => {
        setSelectedLocation(location);
        setShowLocationCard(true);
    };

    // Cuando se selecciona personal desde el buscador:
    // busca el destino que coincida con su departamento y navega hacia él
    const handlePersonSelect = (person: IPersonal) => {
        const destino = findDestinoByDepartamento(allLocations, person.departamento);

        if (!destino) {
            Alert.alert(
                'Ubicación no encontrada',
                `No hay un lugar registrado para el departamento "${person.departamento}".`
            );
            return;
        }

        const nombreCompleto = [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
            .filter(Boolean).join(' ');

        setSelectedPerson(person);
        setSelectedEvent(null);
        setSelectedLocation(destino as unknown as LocationType);
        setShowLocationCard(false);

        mapRef.current?.animateToRegion({
            latitude: destino.posicion.latitude,
            longitude: destino.posicion.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 600);

        if (currentLocation) {
            calcularRuta(currentLocation, destino.posicion);
        }
    };

    // Cuando se selecciona un evento desde el buscador:
    // busca el destino por _id y navega hacia él
    const handleEventSelect = (event: IEvent) => {
        const destinoId = typeof event.destino === "object"
            ? (event.destino as any)._id
            : event.destino;

        const destino = allLocations.find(l => l._id === destinoId);

        if (!destino) {
            Alert.alert(
                'Ubicación no encontrada',
                `No se encontró el lugar asociado a este evento.`
            );
            return;
        }

        setSelectedPerson(null);
        setSelectedEvent(event);
        setSelectedLocation(destino as unknown as LocationType);
        setShowLocationCard(false);

        mapRef.current?.animateToRegion({
            latitude: destino.posicion.latitude,
            longitude: destino.posicion.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 600);

        if (currentLocation) {
            calcularRuta(currentLocation, destino.posicion);
        }
    };

    const handleStartNavigation = () => {
        setIsNavigating(true);
        setShowLocationCard(false);
        iniciarTrackingGPS();
        Alert.alert('Navegación iniciada', 'Se recalculará automáticamente si te desvías.');
    };

    const handleCloseRoute = () => {
        setRouteCoordinates([]);
        setRouteInfo(null);
        setSelectedLocation(null);
        setSelectedPerson(null);
        setSelectedEvent(null);
        setSearchText("");
        setIsNavigating(false);
        setShowLocationCard(false);
        detenerTrackingGPS();

        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    const handleCloseLocationCard = () => {
        setShowLocationCard(false);
    };

    if (loadingLocation) {
        return (
            <View style={[styles.container, localStyles.loadingContainer]}>
                <View style={localStyles.loadingCard}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={localStyles.loadingText}>Obteniendo ubicación...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={INITIAL_REGION}
                showsUserLocation={true}
                mapType="hybrid"
                showsMyLocationButton={true}
                followsUserLocation={isNavigating}
                onRegionChangeComplete={(r) => { regionRef.current = r; }}
            >
                {/* ── Outside dim overlay (hole = UTEQ campus) ── */}
                <Polygon
                    coordinates={OUTER_BOUND}
                    holes={[UTEQ_POLYGON]}
                    strokeWidth={0}
                    fillColor="rgba(10, 15, 30, 0.38)"
                />

                {/* ── UTEQ campus border ── */}
                <Polygon
                    coordinates={UTEQ_POLYGON}
                    strokeColor="#1A73E8"
                    strokeWidth={2.5}
                    fillColor="rgba(26, 115, 232, 0.07)"
                    lineDashPattern={[6, 4]}
                />

                {/* ── All Location Markers ── */}
                {allLocations.map((loc) => {
                    const isSelected = selectedLocation?._id === loc._id;
                    const initial = loc.nombre.trim().charAt(0).toUpperCase();

                    return (
                        <Marker
                            key={loc._id}
                            coordinate={loc.posicion}
                            onPress={() => handleMarkerPress(loc)}
                            anchor={{ x: 0.5, y: 1 }}
                            zIndex={isSelected ? 10 : 1}
                        >
                            <View style={localStyles.markerWrapper}>
                                <View style={[
                                    localStyles.markerBubble,
                                    isSelected && localStyles.markerBubbleSelected,
                                ]}>
                                    <Text style={[
                                        localStyles.markerInitial,
                                        isSelected && localStyles.markerInitialSelected,
                                    ]}>
                                        {initial}
                                    </Text>
                                </View>
                                <View style={[
                                    localStyles.markerTail,
                                    isSelected && localStyles.markerTailSelected,
                                ]} />
                            </View>
                            <Callout tooltip>
                                <View style={localStyles.callout}>
                                    <Text style={localStyles.calloutTitle} numberOfLines={2}>
                                        {loc.nombre}
                                    </Text>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}

                {/* ── User location marker ── */}
                {currentLocation && (
                    <Marker
                        coordinate={currentLocation}
                        anchor={{ x: 0.5, y: 0.5 }}
                        zIndex={20}
                    >
                        <View style={localStyles.userMarker}>
                            <View style={localStyles.userMarkerInner} />
                            <View style={localStyles.userMarkerRing} />
                        </View>
                    </Marker>
                )}

                {/* ── Route Polyline ── */}
                {routeCoordinates.length > 0 && (
                    <>
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="rgba(0,0,0,0.15)"
                            strokeWidth={8}
                        />
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#4285F4"
                            strokeWidth={5}
                        />
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="rgba(255,255,255,0.6)"
                            strokeWidth={2}
                            lineDashPattern={[10, 15]}
                        />
                    </>
                )}
            </MapView>

            {/* ── Search Bar ── */}
            <SearchBar
                value={searchText}
                onChange={setSearchText}
                onSelectLocation={handleLocationSelect}
                onSelectEvent={handleEventSelect}
                onSelectPerson={handlePersonSelect}
            />

            {/* ── Location Info Card ── */}
            {showLocationCard && selectedLocation && !routeInfo && (
                <LocationInfoCard
                    location={selectedLocation}
                    onClose={handleCloseLocationCard}
                    onNavigate={() => {
                        if (currentLocation) {
                            calcularRuta(currentLocation, selectedLocation.posicion);
                            setShowLocationCard(false);
                        }
                    }}
                />
            )}

            {/* ── Route Info Sheet ── */}
            <RouteInfoSheet
                routeInfo={routeInfo}
                destinationName={selectedLocation?.nombre}
                selectedLocation={selectedPerson || selectedEvent ? null : selectedLocation}
                selectedPerson={selectedPerson}
                selectedEvent={selectedEvent}
                onClose={handleCloseRoute}
                onStartNavigation={handleStartNavigation}
                isNavigating={isNavigating}
                isRecalculating={recalculando}
            />

            {/* ── Recalculating overlay badge ── */}
            {recalculando && (
                <View style={localStyles.recalcBadge}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={localStyles.recalcText}>Recalculando ruta...</Text>
                </View>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 12,
    },
    loadingText: {
        fontSize: 15,
        color: '#5F6368',
        fontWeight: '500',
    },
    markerWrapper: { alignItems: 'center' },
    markerBubble: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: MARKER_BLUE,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
        borderWidth: 2, borderColor: '#fff',
    },
    markerBubbleSelected: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#1557B0', borderWidth: 2.5,
        shadowOpacity: 0.4, shadowRadius: 7, elevation: 9,
    },
    markerInitial: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0 },
    markerInitialSelected: { fontSize: 13 },
    markerTail: {
        width: 0, height: 0,
        borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderTopColor: MARKER_BLUE, marginTop: -1,
    },
    markerTailSelected: {
        borderTopColor: '#1557B0',
        borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    },
    userMarker: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    userMarkerInner: {
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: '#4285F4', borderWidth: 2.5, borderColor: '#fff',
        position: 'absolute', zIndex: 2,
        shadowColor: '#4285F4', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
    },
    userMarkerRing: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: 'rgba(66,133,244,0.2)',
        borderWidth: 1.5, borderColor: 'rgba(66,133,244,0.4)',
    },
    callout: {
        backgroundColor: '#fff', borderRadius: 12, padding: 12, maxWidth: 180,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    },
    calloutTitle: { fontSize: 13, fontWeight: '700', color: '#202124', lineHeight: 18 },
    recalcBadge: {
        position: 'absolute', top: 100, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(30,30,30,0.82)',
        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
        gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 12, elevation: 10,
    },
    recalcText: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
});

export default MapViewContainer;
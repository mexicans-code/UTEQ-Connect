import React, { useRef, useState, useEffect } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from 'expo-location';
import axios from "axios";
import styles from "../../styles/MapViewStyle";
import SearchBar from "./SearchBar";
import { Location as LocationType, RouteInfo, Coordinates, PersonData } from "../../types";
import { GOOGLE_MAPS_API_KEY } from "../../config/maps";
import { decodePolyline } from "../../utils/polyline";
import { estaFueraDeRuta } from "../../utils/geoUtils";
import RouteInfoSheet from "./RouteInfoSheet";

const UTEQ_COORDS: Coordinates = {
    latitude: 20.65398463798,
    longitude: -100.40607234656,
};

const INITIAL_REGION: Region = {
    ...UTEQ_COORDS,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

const MapViewContainer = () => {
    const [searchText, setSearchText]           = useState("");
    const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
    const [currentLocation, setCurrentLocation]   = useState<Coordinates | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
    const [routeInfo, setRouteInfo]               = useState<RouteInfo | null>(null);
    const [loadingLocation, setLoadingLocation]   = useState(true);
    const [isNavigating, setIsNavigating]         = useState(false);
    const [recalculando, setRecalculando]         = useState(false);

    const mapRef                  = useRef<MapView>(null);
    const regionRef               = useRef<Region>(INITIAL_REGION);
    const locationSubscription    = useRef<Location.LocationSubscription | null>(null);
    const lastRecalculationTime   = useRef<number>(0);

    useEffect(() => {
        obtenerUbicacionActual();
        return () => { locationSubscription.current?.remove(); };
    }, []);

    // ── GPS ────────────────────────────────────────────────────────────────────

    const obtenerUbicacionActual = async () => {
        try {
            setLoadingLocation(true);
            const USE_TESTING_LOCATION = true;

            if (USE_TESTING_LOCATION) {
                setCurrentLocation(UTEQ_COORDS);
                mapRef.current?.animateToRegion({ ...UTEQ_COORDS, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
                setLoadingLocation(false);
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación.");
                setLoadingLocation(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const coords: Coordinates = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setCurrentLocation(coords);
            mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        } catch (e) {
            console.error("Error obteniendo ubicación:", e);
            Alert.alert("Error", "No se pudo obtener tu ubicación actual");
        } finally {
            setLoadingLocation(false);
        }
    };

    const iniciarTrackingGPS = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;
            locationSubscription.current?.remove();

            locationSubscription.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 3000, distanceInterval: 10 },
                (loc) => {
                    const nueva: Coordinates = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    setCurrentLocation(nueva);

                    if (mapRef.current && isNavigating) {
                        mapRef.current.animateToRegion({ ...nueva, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
                    }
                    if (isNavigating && routeCoordinates.length > 0 && selectedLocation) {
                        verificarDesvio(nueva);
                    }
                }
            );
        } catch (e) {
            console.error("Error iniciando tracking:", e);
        }
    };

    const detenerTrackingGPS = () => {
        locationSubscription.current?.remove();
        locationSubscription.current = null;
    };

    const verificarDesvio = (ubicacion: Coordinates) => {
        const UMBRAL = 50;
        const MIN_RECALCULO = 10000;
        const ahora = Date.now();
        if (recalculando || ahora - lastRecalculationTime.current < MIN_RECALCULO) return;

        if (estaFueraDeRuta(ubicacion, routeCoordinates, UMBRAL) && selectedLocation) {
            Alert.alert("Desvío detectado", "Recalculando ruta...", [{ text: "OK" }], { cancelable: true });
            lastRecalculationTime.current = ahora;
            calcularRuta(ubicacion, selectedLocation.posicion);
        }
    };

    // ── Route ──────────────────────────────────────────────────────────────────

    const calcularRuta = async (origen: Coordinates, destino: Coordinates) => {
        try {
            setRecalculando(true);

            const params = new URLSearchParams({
                origin:       `${origen.latitude},${origen.longitude}`,
                destination:  `${destino.latitude},${destino.longitude}`,
                key:          GOOGLE_MAPS_API_KEY,
                language:     "es",
                alternatives: "true",
                units:        "metric",
                region:       "mx",
                mode:         "walking",
            });

            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/directions/json?${params}`,
                { timeout: 10000 }
            );

            if (response.data.status === "OK" && response.data.routes.length) {
                const bestRoute = response.data.routes.reduce((best: any, r: any) =>
                    r.legs[0].duration.value < best.legs[0].duration.value ? r : best
                );

                const leg = bestRoute.legs[0];
                if (!leg || !bestRoute.overview_polyline?.points) throw new Error("Datos de ruta incompletos");

                const points = decodePolyline(bestRoute.overview_polyline.points).filter(
                    (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude) &&
                           Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180
                );

                if (!points.length) throw new Error("Puntos de ruta inválidos");

                setRouteCoordinates(points);
                setRouteInfo({
                    distancia:      leg.distance?.text  || "No disponible",
                    duracion:       leg.duration?.text  || "No disponible",
                    distanciaValor: leg.distance?.value || 0,
                    duracionValor:  leg.duration?.value || 0,
                });

                mapRef.current?.fitToCoordinates(
                    [origen, ...points.slice(0, 100), destino],
                    { edgePadding: { top: 120, right: 80, bottom: 280, left: 80 }, animated: true }
                );
            } else {
                Alert.alert("Ruta no encontrada", "No se pudo encontrar una ruta.");
                setRouteCoordinates([]);
                setRouteInfo(null);
            }
        } catch (e: any) {
            console.error("Error al calcular ruta:", e);
            Alert.alert("Error", "No se pudo calcular la ruta: " + e.message);
            setRouteCoordinates([]);
            setRouteInfo(null);
        } finally {
            setRecalculando(false);
        }
    };

    // ── Handlers ───────────────────────────────────────────────────────────────

    /**
     * Único handler para los tres tipos (lugar / persona / evento).
     *
     * - Si viene personData → enriquece el location con isPerson = true
     * - Si el location ya trae isEvent = true (lo pone SearchBar) → se guarda tal cual
     * - En ningún caso se sobreescribe isEvent con isPerson ni viceversa
     */
    const handleLocationSelect = (location: LocationType, personData?: PersonData) => {
        let locationToSave: LocationType;

        if (personData) {
            // Persona: añadir datos del empleado
            locationToSave = {
                ...location,
                isPerson:       true,
                numeroEmpleado: personData.numeroEmpleado,
                nombreCompleto: personData.nombreCompleto,
                email:          personData.email,
                telefono:       personData.telefono,
                cargo:          personData.cargo,
                departamento:   personData.departamento,
                cubiculo:       personData.cubiculo,
                planta:         personData.planta,
            };
        } else {
            // Lugar estándar O evento — el location llega ya completo desde SearchBar
            locationToSave = { ...location };
        }

        setSelectedLocation(locationToSave);

        mapRef.current?.animateToRegion(
            { ...location.posicion, latitudeDelta: 0.005, longitudeDelta: 0.005 },
            500
        );

        if (currentLocation) {
            calcularRuta(currentLocation, location.posicion);
        } else {
            Alert.alert("Esperando ubicación", "Obteniendo tu ubicación actual...");
        }
    };

    const handleStartNavigation = () => {
        setIsNavigating(true);
        iniciarTrackingGPS();
        Alert.alert("Navegación iniciada", "Se recalculará automáticamente si te desvías.");
    };

    const handleCloseRoute = () => {
        setRouteCoordinates([]);
        setRouteInfo(null);
        setSelectedLocation(null);
        setSearchText("");
        setIsNavigating(false);
        detenerTrackingGPS();

        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion(
                { ...currentLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                500
            );
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    if (loadingLocation) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#4285F4" />
            </View>
        );
    }

    const markerPinColor = selectedLocation?.isEvent
        ? "orange"
        : selectedLocation?.isPerson
            ? "red"
            : "red";

    const markerTitle = selectedLocation?.isEvent
        ? selectedLocation.eventTitulo
        : selectedLocation?.nombre;

    const markerDescription = selectedLocation?.isEvent
        ? `${selectedLocation.eventHoraInicio}–${selectedLocation.eventHoraFin}`
        : selectedLocation?.isPerson
            ? selectedLocation.cargo
            : undefined;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={INITIAL_REGION}
                showsUserLocation
                mapType="hybrid"
                showsMyLocationButton
                followsUserLocation={isNavigating}
                onRegionChangeComplete={(r) => { regionRef.current = r; }}
            >
                {currentLocation && (
                    <Marker
                        coordinate={currentLocation}
                        title="Tu ubicación"
                        description={isNavigating ? "Navegando..." : "Ubicación actual"}
                        pinColor="blue"
                    />
                )}

                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation.posicion}
                        title={markerTitle}
                        description={markerDescription}
                        pinColor={markerPinColor}
                    />
                )}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#4285F4"
                        strokeWidth={4}
                    />
                )}
            </MapView>

            <SearchBar
                value={searchText}
                onChange={setSearchText}
                onSelectLocation={handleLocationSelect}
            />

            <RouteInfoSheet
                routeInfo={routeInfo}
                destinationName={selectedLocation?.nombre}
                selectedLocation={selectedLocation}
                onClose={handleCloseRoute}
                onStartNavigation={handleStartNavigation}
                isNavigating={isNavigating}
                isRecalculating={recalculando}
            />
        </View>
    );
};

export default MapViewContainer;
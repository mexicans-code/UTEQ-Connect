import React, { useRef, useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, ActivityIndicator, Modal, Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteInfo } from "../../types";
import { routeInfoSheetStyles as styles, ACCENT, GREEN } from "../../styles/RouteInfoSheetStyle";
import LocationInformation from "./LocationInformation";
import { IPersonal, IEvent } from "../../types/search.types";

interface RouteInfoSheetProps {
    routeInfo: RouteInfo | null;
    destinationName?: string;
    selectedLocation?: any;
    selectedPerson?: IPersonal | null;
    selectedEvent?: IEvent | null;
    onClose: () => void;
    onStartNavigation?: () => void;
    isNavigating?: boolean;
    isRecalculating?: boolean;
}

const RouteInfoSheet: React.FC<RouteInfoSheetProps> = ({
    routeInfo, destinationName, selectedLocation, selectedPerson, selectedEvent,
    onClose, onStartNavigation, isNavigating = false, isRecalculating = false,
}) => {
    const [isExpanded, setIsExpanded]             = useState(true);
    const [showLocationInfo, setShowLocationInfo] = useState(false);

    const slideAnim   = useRef(new Animated.Value(320)).current;
    const pulseAnim   = useRef(new Animated.Value(1)).current;
    const dotScale    = useRef(new Animated.Value(1)).current;
    const prevVisible = useRef(false);

    useEffect(() => {
        const nowVisible = !!routeInfo;
        if (nowVisible && !prevVisible.current) {
            Animated.spring(slideAnim, { toValue: 0, tension: 62, friction: 12, useNativeDriver: true }).start();
        } else if (!nowVisible && prevVisible.current) {
            Animated.timing(slideAnim, { toValue: 320, duration: 220, useNativeDriver: true }).start();
        }
        prevVisible.current = nowVisible;
    }, [routeInfo]);

    useEffect(() => {
        if (isNavigating) {
            Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
            ])).start();
            Animated.loop(Animated.sequence([
                Animated.spring(dotScale, { toValue: 1.4, tension: 80, friction: 6, useNativeDriver: true }),
                Animated.spring(dotScale, { toValue: 1,   tension: 80, friction: 6, useNativeDriver: true }),
            ])).start();
        } else {
            pulseAnim.stopAnimation(); pulseAnim.setValue(1);
            dotScale.stopAnimation();  dotScale.setValue(1);
        }
    }, [isNavigating]);
    

    if (!routeInfo) return null;

    const handleStart = () => { onStartNavigation?.(); setIsExpanded(false); };

    const etaText = (() => {
        if (!routeInfo.duracionValor) return routeInfo.duracion;
        const d = new Date();
        d.setSeconds(d.getSeconds() + routeInfo.duracionValor);
        return `~${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    })();

    return (
        <>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                <TouchableOpacity style={styles.handleWrap}
                    onPress={() => setIsExpanded(!isExpanded)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 40, right: 40 }}>
                    <View style={styles.handle} />
                </TouchableOpacity>

                {/* ── MINIMIZED ── */}
                {!isExpanded && (
                    <TouchableOpacity style={styles.minimizedRow}
                        onPress={() => setIsExpanded(true)} activeOpacity={0.8}>
                        <View style={[styles.miniIcon, isNavigating && styles.miniIconActive]}>
                            <Ionicons name="navigate" size={16} color="#fff" />
                        </View>
                        <View style={styles.miniInfo}>
                            <Text style={styles.miniDest} numberOfLines={1}>
                                {destinationName || "Destino"}
                            </Text>
                            <View style={styles.miniStats}>
                                <Text style={styles.miniStat}>{routeInfo.distancia}</Text>
                                <Text style={styles.miniDot}>·</Text>
                                <Text style={styles.miniStat}>{routeInfo.duracion}</Text>
                                {isNavigating && (
                                    <>
                                        <Text style={styles.miniDot}>·</Text>
                                        <Animated.View style={[styles.liveDot, { opacity: pulseAnim, transform: [{ scale: dotScale }] }]} />
                                        <Text style={[styles.miniStat, { color: GREEN }]}>En ruta</Text>
                                    </>
                                )}
                            </View>
                        </View>
                        <Ionicons name="chevron-up" size={20} color="#9AA0A6" />
                    </TouchableOpacity>
                )}

                {/* ── EXPANDED ── */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.destHeader}>
                            <View style={styles.destIconWrap}>
                                <Ionicons name="location" size={20} color={ACCENT} />
                            </View>
                            <View style={styles.destInfo}>
                                <Text style={styles.destLabel}>Hacia</Text>
                                <Text style={styles.destName} numberOfLines={1}>
                                    {destinationName || "Destino"}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.xBtn} onPress={onClose} activeOpacity={0.7}>
                                <Ionicons name="close" size={18} color="#9AA0A6" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: "#EAF1FB" }]}>
                                    <MaterialCommunityIcons name="walk" size={18} color={ACCENT} />
                                </View>
                                <Text style={styles.statValue}>{routeInfo.distancia}</Text>
                                <Text style={styles.statLabel}>Distancia</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
                                    <Ionicons name="time-outline" size={18} color={GREEN} />
                                </View>
                                <Text style={styles.statValue}>{routeInfo.duracion}</Text>
                                <Text style={styles.statLabel}>Tiempo</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
                                    <Ionicons name="flag-outline" size={18} color="#F57C00" />
                                </View>
                                <Text style={[styles.statValue, { fontSize: 13 }]}>{etaText}</Text>
                                <Text style={styles.statLabel}>Llegada</Text>
                            </View>
                        </View>

                        {isRecalculating && (
                            <View style={styles.recalcBanner}>
                                <ActivityIndicator size="small" color="#9A7D00" />
                                <Text style={styles.recalcText}>Recalculando ruta...</Text>
                            </View>
                        )}

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.startBtn, isNavigating && styles.startBtnActive, isRecalculating && styles.startBtnDisabled]}
                                onPress={handleStart}
                                disabled={isNavigating || isRecalculating}
                                activeOpacity={0.85}>
                                {isRecalculating ? (
                                    <><ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.startBtnText}>Recalculando...</Text></>
                                ) : isNavigating ? (
                                    <><Animated.View style={[styles.pulseRing, { opacity: pulseAnim }]} />
                                    <Ionicons name="navigate" size={18} color="#fff" />
                                    <Text style={styles.startBtnText}>Navegando</Text></>
                                ) : (
                                    <><Ionicons name="play-circle" size={20} color="#fff" />
                                    <Text style={styles.startBtnText}>Iniciar navegación</Text></>
                                )}
                            </TouchableOpacity>

                            <View style={styles.secondaryRow}>
                                {(selectedLocation || selectedPerson || selectedEvent) && (
                                    <TouchableOpacity
                                        style={styles.secondaryBtn}
                                        onPress={() => setShowLocationInfo(true)}
                                        activeOpacity={0.75}>
                                        <Ionicons name="information-circle-outline" size={17} color={ACCENT} />
                                        <Text style={styles.secondaryBtnText}>Más información</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.secondaryBtn, styles.closeSecondaryBtn]}
                                    onPress={onClose} activeOpacity={0.7}>
                                    <Ionicons name="close-circle-outline" size={17} color="#9AA0A6" />
                                    <Text style={[styles.secondaryBtnText, { color: "#9AA0A6" }]}>
                                        {isNavigating ? "Detener" : "Cerrar ruta"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* Más información — location o person según contexto */}
            <Modal
                visible={showLocationInfo}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowLocationInfo(false)}>
                <LocationInformation
                    location={selectedPerson || selectedEvent ? null : selectedLocation}
                    person={selectedPerson ?? null}
                    event={selectedEvent ?? null}
                    onClose={() => setShowLocationInfo(false)}
                />
            </Modal>
        </>
    );
};

export default RouteInfoSheet;
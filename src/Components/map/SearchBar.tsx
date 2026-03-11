import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    FlatList, Animated, ActivityIndicator, StyleSheet, Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getLocations, Location } from "../../api/locations";
import { getActiveEvents, getAllPersonal, getNombreCompleto } from "../../api/eventsAndPersonal";
import { IEvent, IPersonal, SearchCategory, SearchResult } from "../../types/search.types";

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORIES: { key: SearchCategory; label: string; icon: string }[] = [
    { key: "all",    label: "Todo",     icon: "apps"     },
    { key: "places", label: "Lugares",  icon: "location" },
    { key: "events", label: "Eventos",  icon: "calendar" },
    { key: "people", label: "Personal", icon: "people"   },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface SearchBarProps {
    value: string;
    onChange: (text: string) => void;
    onSelectLocation?: (location: Location) => void;
    onSelectEvent?: (event: IEvent) => void;
    onSelectPerson?: (person: IPersonal) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const SearchBar: React.FC<SearchBarProps> = ({
    value, onChange, onSelectLocation, onSelectEvent, onSelectPerson,
}) => {
    const [locations, setLocations]     = useState<Location[]>([]);
    const [events, setEvents]           = useState<IEvent[]>([]);
    const [personal, setPersonal]       = useState<IPersonal[]>([]);
    const [loading, setLoading]         = useState(false);
    const [results, setResults]         = useState<SearchResult[]>([]);
    const [category, setCategory]       = useState<SearchCategory>("all");
    const [isFocused, setIsFocused]     = useState(false);
    const [showResults, setShowResults] = useState(false);

    const inputRef   = useRef<TextInput>(null);
    const shadowAnim = useRef(new Animated.Value(0)).current;
    const listAnim   = useRef(new Animated.Value(0)).current;

    // Load all data from real APIs
    useEffect(() => {
        setLoading(true);
        Promise.all([
            getLocations().catch(() => [] as Location[]),
            getActiveEvents().catch(() => [] as IEvent[]),
            getAllPersonal().catch(() => [] as IPersonal[]),
        ]).then(([locs, evts, ppl]) => {
            setLocations(locs);
            setEvents(evts);
            setPersonal(ppl);
        }).finally(() => setLoading(false));
    }, []);

    // Focus shadow
    useEffect(() => {
        Animated.timing(shadowAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    // Filter: startsWith first, then includes
    useEffect(() => {
        const q = value.trim().toLowerCase();
        if (q.length === 0) { setResults([]); setShowResults(false); return; }

        // Safe lowercase helper — returns "" if value is null/undefined
        const s = (v?: string) => (v ?? "").toLowerCase();

        const filtered: SearchResult[] = [];

        if (category === "all" || category === "places") {
            const starts = locations.filter(l => s(l.nombre).startsWith(q));
            const rest   = locations.filter(l => !s(l.nombre).startsWith(q) && s(l.nombre).includes(q));
            [...starts, ...rest].slice(0, 4).forEach(l => filtered.push({ kind: "place", data: l }));
        }

        if (category === "all" || category === "events") {
            const starts = events.filter(e => s(e.titulo).startsWith(q));
            const rest   = events.filter(e => {
                if (s(e.titulo).startsWith(q)) return false;
                const dest = typeof e.destino === "object" ? s((e.destino as any)?.nombre) : "";
                return s(e.titulo).includes(q) || dest.includes(q);
            });
            [...starts, ...rest].slice(0, 3).forEach(e => filtered.push({ kind: "event", data: e }));
        }

        if (category === "all" || category === "people") {
            const starts = personal.filter(p => {
                const full = s(getNombreCompleto(p));
                return full.startsWith(q) || s(p.apellidoPaterno).startsWith(q);
            });
            const rest = personal.filter(p => {
                const full = s(getNombreCompleto(p));
                if (full.startsWith(q) || s(p.apellidoPaterno).startsWith(q)) return false;
                return full.includes(q) || s(p.departamento).includes(q) || s(p.cargo).includes(q);
            });
            [...starts, ...rest].slice(0, 3).forEach(p => filtered.push({ kind: "person", data: p }));
        }

        setResults(filtered);
        const visible = filtered.length > 0;
        setShowResults(visible);
        Animated.spring(listAnim, { toValue: visible ? 1 : 0, tension: 80, friction: 12, useNativeDriver: true }).start();
    }, [value, category, locations, events, personal]);

    const handleSelect = (result: SearchResult) => {
        setShowResults(false);
        inputRef.current?.blur();
        if (result.kind === "place") { onChange(""); onSelectLocation?.(result.data); }
        else if (result.kind === "event") { onChange(""); onSelectEvent?.(result.data); }
        else { onChange(""); onSelectPerson?.(result.data); }
    };

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" }); }
        catch { return iso; }
    };

    const getDestinoName = (destino: IEvent["destino"]) =>
        typeof destino === "object" && destino !== null ? (destino as any).nombre ?? "Campus" : "Campus";

    const shadowStyle = {
        shadowOpacity: shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.22] }),
        shadowRadius:  shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 28] }),
    };

    const renderResult = ({ item, index }: { item: SearchResult; index: number }) => {
        const isLast = index === results.length - 1;
        const rowStyle = [styles.resultRow, isLast && styles.resultRowLast];

        if (item.kind === "place") {
            return (
                <TouchableOpacity style={rowStyle} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                    <View style={[styles.resultIconWrap, { backgroundColor: "#EAF1FB" }]}>
                        <MaterialIcons name="place" size={17} color="#003366" />
                    </View>
                    <View style={styles.resultText}>
                        <Text style={styles.resultTitle} numberOfLines={1}>{item.data.nombre}</Text>
                        <Text style={styles.resultSub}>Ubicación en campus</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#BDC1C6" />
                </TouchableOpacity>
            );
        }

        if (item.kind === "event") {
            const sinCupos = item.data.cuposDisponibles === 0;
            return (
                <TouchableOpacity style={rowStyle} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                    <View style={[styles.resultIconWrap, { backgroundColor: "#FFF3E0" }]}>
                        <Ionicons name="calendar" size={17} color="#F57C00" />
                    </View>
                    <View style={styles.resultText}>
                        <Text style={styles.resultTitle} numberOfLines={1}>{item.data.titulo}</Text>
                        <Text style={styles.resultSub} numberOfLines={1}>
                            {getDestinoName(item.data.destino)} · {formatDate(item.data.fechaInicio)} · {item.data.horaInicio}
                        </Text>
                    </View>
                    <View style={[styles.kindBadge, { backgroundColor: sinCupos ? "#FDEEEC" : "#FFF3E0" }]}>
                        <Text style={[styles.kindLabel, { color: sinCupos ? "#EA4335" : "#F57C00" }]}>
                            {sinCupos ? "Lleno" : `${item.data.cuposDisponibles} cupos`}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        const initials = [item.data.nombre, item.data.apellidoPaterno]
            .map(v => (v ?? "").charAt(0))
            .join("")
            .toUpperCase() || "?";
        return (
            <TouchableOpacity style={rowStyle} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                <View style={[styles.resultIconWrap, { backgroundColor: "#E8F5E9" }]}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#34A853" }}>{initials}</Text>
                </View>
                <View style={styles.resultText}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{getNombreCompleto(item.data)}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{item.data.cargo} · {item.data.departamento}</Text>
                </View>
                <View style={[styles.kindBadge, { backgroundColor: "#E8F5E9" }]}>
                    <Text style={[styles.kindLabel, { color: "#34A853" }]}>Personal</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <Animated.View style={[styles.searchPill, shadowStyle]}>
                <Ionicons name="search" size={19} color={isFocused ? "#003366" : "#9AA0A6"} style={styles.searchIcon} />
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Buscar lugares, eventos, personal..."
                    placeholderTextColor="#BDC1C6"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {loading && <ActivityIndicator size="small" color="#BDC1C6" style={{ marginLeft: 8 }} />}
                {!loading && value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => { onChange(""); setShowResults(false); inputRef.current?.focus(); }}
                        style={styles.clearBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <View style={styles.clearCircle}>
                            <Ionicons name="close" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {isFocused && value.length > 0 && (
                <View style={styles.chipsRow}>
                    {CATEGORIES.map((cat) => {
                        const active = category === cat.key;
                        return (
                            <TouchableOpacity key={cat.key}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => setCategory(cat.key)} activeOpacity={0.75}>
                                <Ionicons name={cat.icon as any} size={13} color={active ? "#fff" : "#5F6368"} />
                                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{cat.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {showResults && (
                <Animated.View style={[styles.dropdown, {
                    opacity: listAnim,
                    transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
                }]}>
                    <FlatList
                        data={results}
                        keyExtractor={(item, i) => `${item.kind}-${item.data._id}-${i}`}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={results.length > 5}
                        style={{ maxHeight: 320 }}
                        renderItem={renderResult}
                    />
                    {results.length === 0 && !loading && (
                        <View style={styles.emptyRow}>
                            <Text style={styles.emptyText}>Sin resultados para "{value}"</Text>
                        </View>
                    )}
                </Animated.View>
            )}
        </View>
    );
};

export default SearchBar;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: Platform.OS === "ios" ? 56 : 40,
        left: 16,
        right: 16,
        zIndex: 200,
    },
    searchPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 28,
        paddingHorizontal: 16,
        height: 52,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    searchIcon: { marginRight: 10 },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#202124",
        fontWeight: "400",
        paddingVertical: 0,
    },
    clearBtn: { marginLeft: 8 },
    clearCircle: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: "#BDC1C6",
        justifyContent: "center", alignItems: "center",
    },
    chipsRow: {
        flexDirection: "row", gap: 8,
        marginTop: 10, paddingHorizontal: 2,
    },
    chip: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "#fff", borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 7,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    },
    chipActive: { backgroundColor: "#003366" },
    chipLabel: { fontSize: 12, fontWeight: "600", color: "#5F6368" },
    chipLabelActive: { color: "#fff" },
    dropdown: {
        backgroundColor: "#fff", borderRadius: 20, marginTop: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14, shadowRadius: 24, elevation: 12, overflow: "hidden",
    },
    resultRow: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 13, gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F3F4",
    },
    resultRowLast: { borderBottomWidth: 0 },
    resultIconWrap: {
        width: 36, height: 36, borderRadius: 12,
        justifyContent: "center", alignItems: "center",
    },
    resultText: { flex: 1 },
    resultTitle: { fontSize: 14, fontWeight: "600", color: "#202124" },
    resultSub: { fontSize: 12, color: "#9AA0A6", marginTop: 2 },
    kindBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    kindLabel: { fontSize: 11, fontWeight: "700" },
    emptyRow: { padding: 20, alignItems: "center" },
    emptyText: { fontSize: 13, color: "#9AA0A6" },
});
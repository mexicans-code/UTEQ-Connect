import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Platform, Image } from "react-native";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { IDestino, IPersonal, IEvent, IEspacio } from "../../types/search.types";
import { buildImageUrl } from "../../utils/imageUrl";

const ACCENT = "#003366";

interface LocationInformationProps {
    location?: IDestino | null;
    person?: IPersonal | null;
    event?: IEvent | null;
    onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getEspacio = (e: string | IEspacio | undefined | null): IEspacio | null => {
    if (!e || typeof e === "string") return null;
    return e as IEspacio;
};

const PlantaBadge: React.FC<{ planta: string }> = ({ planta }) => (
    <View style={localInfoStyles.plantaBadge}>
        <Text style={localInfoStyles.plantaBadgeText}>Planta {planta}</Text>
    </View>
);

// ─── Espacio card (reutilizable) ──────────────────────────────────────────────
const EspacioCard: React.FC<{ espacio: IEspacio }> = ({ espacio }) => (
    <View style={localInfoStyles.espacioCard}>
        {/* Nombre + badge planta en la misma fila, nombre trunca si es largo */}
        <View style={localInfoStyles.espacioHeaderRow}>
            <MaterialCommunityIcons name="office-building" size={15} color="#5F6368" />
            <Text style={localInfoStyles.espacioNombre} numberOfLines={1} ellipsizeMode="tail">
                {espacio.nombre}
            </Text>
            <PlantaBadge planta={espacio.planta} />
        </View>

        {/* Descripción */}
        {espacio.descripcion && (
            <View style={localInfoStyles.espacioRow}>
                <Ionicons name="information-circle-outline" size={14} color="#9AA0A6" />
                <Text style={localInfoStyles.espacioDesc}>{espacio.descripcion}</Text>
            </View>
        )}

        {/* Cupos + badge ocupado/disponible */}
        <View style={localInfoStyles.espacioFooterRow}>
            <View style={localInfoStyles.espacioRow}>
                <Ionicons name="people-outline" size={14} color="#9AA0A6" />
                <Text style={localInfoStyles.espacioCupos}>{espacio.cupos} cupos</Text>
            </View>
            <View style={[
                localInfoStyles.statusBadge,
                { backgroundColor: espacio.ocupado ? "#FDEEEC" : "#E8F5E9" }
            ]}>
                <View style={[
                    localInfoStyles.statusDot,
                    { backgroundColor: espacio.ocupado ? "#EA4335" : "#34A853" }
                ]} />
                <Text style={[
                    localInfoStyles.statusText,
                    { color: espacio.ocupado ? "#EA4335" : "#34A853" }
                ]}>
                    {espacio.ocupado ? "Ocupado" : "Disponible"}
                </Text>
            </View>
        </View>
    </View>
);

// ─── Event view ───────────────────────────────────────────────────────────────
const EventView: React.FC<{ event: IEvent; onClose: () => void }> = ({ event, onClose }) => {
    const [imgError, setImgError] = React.useState(false);
    const imageUrl = buildImageUrl(event.image);
    const hasImage = !!imageUrl && !imgError;
    const espacio = getEspacio(event.espacio);

    const formatDate = (iso: string) => {
        try {
            const [year, month, day] = iso.substring(0, 10).split("-").map(Number);
            return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
                day: "numeric", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    const isSameDay = event.fechaInicio.substring(0, 10) === event.fechaFin.substring(0, 10);
    const sinCupos = event.cuposDisponibles === 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#5F6368" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Información del evento</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageContainer}>
                    {hasImage ? (
                        <>
                            <Image source={{ uri: imageUrl! }} style={styles.image} resizeMode="cover" onError={() => setImgError(true)} />
                            <View style={styles.imageOverlay} />
                            <Text style={styles.imageTitle} numberOfLines={2}>{event.titulo}</Text>
                        </>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="calendar" size={48} color="#C5C8CE" />
                            <Text style={styles.placeholderLabel}>Sin imagen disponible</Text>
                        </View>
                    )}
                </View>

                {!hasImage && <Text style={styles.locationName}>{event.titulo}</Text>}

                {/* Disponibilidad */}
                <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                    <View style={[styles.infoCard, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
                        <Text style={[styles.infoText, { fontWeight: "600", color: "#202124" }]}>Disponibilidad</Text>
                        <View style={{ backgroundColor: sinCupos ? "#FDEEEC" : "#E8F5E9", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 }}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: sinCupos ? "#EA4335" : "#34A853" }}>
                                {sinCupos ? "Lleno" : `${event.cuposDisponibles} / ${event.cupos} cupos`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Espacio del evento */}
                {espacio && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconWrap}>
                                <MaterialCommunityIcons name="door-open" size={18} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>Espacio / Salón</Text>
                        </View>
                        <EspacioCard espacio={espacio} />
                    </View>
                )}

                {/* Descripción */}
                {event.descripcion && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconWrap}>
                                <Ionicons name="document-text" size={18} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoText}>{event.descripcion}</Text>
                        </View>
                    </View>
                )}

                {/* Fechas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconWrap}>
                            <Ionicons name="calendar" size={18} color={ACCENT} />
                        </View>
                        <Text style={styles.sectionTitle}>Fechas</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={15} color="#5F6368" />
                            <Text style={styles.infoText}>
                                {isSameDay
                                    ? formatDate(event.fechaInicio)
                                    : `${formatDate(event.fechaInicio)} — ${formatDate(event.fechaFin)}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Horario */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconWrap}>
                            <Ionicons name="time" size={18} color={ACCENT} />
                        </View>
                        <Text style={styles.sectionTitle}>{isSameDay ? "Horario" : "Horario diario"}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={15} color="#5F6368" />
                            <Text style={styles.infoText}>{event.horaInicio} — {event.horaFin}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Location view ────────────────────────────────────────────────────────────
const LocationView: React.FC<{ location: IDestino; onClose: () => void }> = ({ location, onClose }) => {
    const [imgError, setImgError] = React.useState(false);
    const imageUrl = buildImageUrl(location.image);
    const hasImage = !!imageUrl && !imgError;
    const tieneEspacios = location.espacios && location.espacios.length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#5F6368" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Información del lugar</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageContainer}>
                    {hasImage ? (
                        <>
                            <Image source={{ uri: imageUrl! }} style={styles.image} resizeMode="cover" onError={() => setImgError(true)} />
                            <View style={styles.imageOverlay} />
                            <Text style={styles.imageTitle} numberOfLines={2}>{location.nombre}</Text>
                        </>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialCommunityIcons name="map-marker-radius" size={48} color="#C5C8CE" />
                            <Text style={styles.placeholderLabel}>Sin imagen disponible</Text>
                        </View>
                    )}
                </View>

                {!hasImage && <Text style={styles.locationName}>{location.nombre}</Text>}

                {/* Coordenadas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconWrap}>
                            <MaterialIcons name="gps-fixed" size={18} color={ACCENT} />
                        </View>
                        <Text style={styles.sectionTitle}>Coordenadas</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            {location.posicion.latitude.toFixed(6)}, {location.posicion.longitude.toFixed(6)}
                        </Text>
                    </View>
                </View>

                {/* Espacios del destino */}
                {tieneEspacios && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconWrap}>
                                <MaterialCommunityIcons name="door-open" size={18} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>
                                Espacios ({location.espacios!.length})
                            </Text>
                        </View>
                        <View style={{ gap: 8 }}>
                            {location.espacios!.map((esp) => (
                                <EspacioCard key={esp._id} espacio={esp} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Ruta pregrabada */}
                {location.rutaPregrabada && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconWrap}>
                                <MaterialCommunityIcons name="map-marker-path" size={18} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>Ruta pregrabada</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Ionicons name="navigate-outline" size={15} color="#5F6368" />
                                <Text style={styles.infoText}>Desde: {location.rutaPregrabada.origen}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="map-marker-distance" size={15} color="#5F6368" />
                                <Text style={styles.infoText}>{location.rutaPregrabada.puntos.length} puntos de ruta</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// ─── Person view ──────────────────────────────────────────────────────────────
const PersonView: React.FC<{ person: IPersonal; onClose: () => void }> = ({ person, onClose }) => {
    const nombreCompleto = [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
        .filter(Boolean).join(" ");
    const initials = [person.nombre, person.apellidoPaterno]
        .map(v => (v ?? "").charAt(0)).join("").toUpperCase() || "?";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#5F6368" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Información del personal</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                    <Text style={styles.personName}>{nombreCompleto}</Text>
                    <View style={styles.cargoBadge}>
                        <Text style={styles.cargoText}>{person.cargo}</Text>
                    </View>
                    <Text style={styles.employeeNumber}>No. Empleado: {person.numeroEmpleado}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconWrap}>
                            <Ionicons name="business" size={18} color={ACCENT} />
                        </View>
                        <Text style={styles.sectionTitle}>Departamento</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>{person.departamento}</Text>
                    </View>
                </View>

                {(person.planta || person.cubiculo) && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconWrap}>
                                <Ionicons name="location" size={18} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>Ubicación física</Text>
                        </View>
                        <View style={styles.infoCard}>
                            {person.planta && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoEmoji}></Text>
                                    <Text style={styles.infoText}>{person.planta}</Text>
                                </View>
                            )}
                            {person.cubiculo && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoEmoji}></Text>
                                    <Text style={styles.infoText}>Cubículo {person.cubiculo}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconWrap}>
                            <Ionicons name="call" size={18} color={ACCENT} />
                        </View>
                        <Text style={styles.sectionTitle}>Contacto</Text>
                    </View>
                    <View style={styles.infoCard}>
                        {person.email && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${person.email}`)} activeOpacity={0.7}>
                                <Ionicons name="mail-outline" size={16} color="#5F6368" />
                                <Text style={[styles.infoText, styles.link]}>{person.email}</Text>
                            </TouchableOpacity>
                        )}
                        {person.telefono && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${person.telefono}`)} activeOpacity={0.7}>
                                <Ionicons name="call-outline" size={16} color="#5F6368" />
                                <Text style={[styles.infoText, styles.link]}>{person.telefono}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.actionsRow}>
                    {person.telefono && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${person.telefono}`)} activeOpacity={0.85}>
                            <Ionicons name="call" size={22} color="#fff" />
                            <Text style={styles.actionBtnText}>Llamar</Text>
                        </TouchableOpacity>
                    )}
                    {person.email && (
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#34A853" }]} onPress={() => Linking.openURL(`mailto:${person.email}`)} activeOpacity={0.85}>
                            <Ionicons name="mail" size={22} color="#fff" />
                            <Text style={styles.actionBtnText}>Email</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Main export ──────────────────────────────────────────────────────────────
const LocationInformation: React.FC<LocationInformationProps> = ({ location, person, event, onClose }) => {
    if (person) return <PersonView person={person} onClose={onClose} />;
    if (event) return <EventView event={event} onClose={onClose} />;
    if (location) return <LocationView location={location} onClose={onClose} />;
    return null;
};

export default LocationInformation;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 16 : 20,
        paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F3F4",
    },
    closeButton: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#202124" },
    scrollContent: { paddingBottom: 40 },
    imageContainer: { height: 200, backgroundColor: "#F1F3F4", overflow: "hidden" },
    image: { width: "100%", height: "100%" },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
    imageTitle: {
        position: "absolute", bottom: 16, left: 20, right: 20,
        fontSize: 22, fontWeight: "800", color: "#fff",
        textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
    },
    imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: "#F8F9FA" },
    placeholderLabel: { fontSize: 13, color: "#9AA0A6" },
    locationName: { fontSize: 22, fontWeight: "800", color: "#202124", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
    avatarSection: { alignItems: "center", paddingTop: 28, paddingBottom: 8, gap: 8 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EAF1FB", justifyContent: "center", alignItems: "center", marginBottom: 4 },
    avatarInitials: { fontSize: 30, fontWeight: "800", color: ACCENT },
    personName: { fontSize: 20, fontWeight: "800", color: "#202124", textAlign: "center", paddingHorizontal: 20 },
    cargoBadge: { backgroundColor: "#EAF1FB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5 },
    cargoText: { fontSize: 13, fontWeight: "600", color: ACCENT },
    employeeNumber: { fontSize: 12, color: "#9AA0A6" },
    section: { paddingHorizontal: 20, marginTop: 20, gap: 8 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#EAF1FB", justifyContent: "center", alignItems: "center" },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#202124" },
    infoCard: { backgroundColor: "#F8F9FA", borderRadius: 14, padding: 14, gap: 8 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoEmoji: { fontSize: 14 },
    infoText: { fontSize: 14, color: "#5F6368", flex: 1, lineHeight: 20 },
    link: { color: ACCENT },
    contactRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2 },
    actionsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginTop: 24 },
    actionBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 24,
        shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    actionBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

const localInfoStyles = StyleSheet.create({
    // Planta badge
    plantaBadge: {
        backgroundColor: "#EAF1FB", borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3,
        flexShrink: 0,  // nunca se encoge
    },
    plantaBadgeText: { fontSize: 11, fontWeight: "700", color: ACCENT },

    // EspacioCard container
    espacioCard: {
        backgroundColor: "#F8F9FA", borderRadius: 14,
        padding: 14, gap: 10,
    },

    // Fila superior: icono + nombre (flex:1 para truncar) + badge planta
    espacioHeaderRow: {
        flexDirection: "row", alignItems: "center",
        gap: 6,
    },
    espacioNombre: {
        flex: 1,  // ocupa espacio sobrante y trunca
        fontSize: 14, fontWeight: "700", color: "#202124",
    },

    // Fila genérica con icono + texto
    espacioRow: {
        flexDirection: "row", alignItems: "flex-start", gap: 6,
    },
    espacioDesc: {
        flex: 1, fontSize: 13, color: "#9AA0A6", lineHeight: 18,
    },
    espacioCupos: {
        fontSize: 13, color: "#5F6368",
    },

    // Fila inferior: cupos a la izquierda, badge a la derecha
    espacioFooterRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
    },

    // Badge ocupado/disponible con punto de color
    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 5,
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
        flexShrink: 0,
    },
    statusDot: {
        width: 7, height: 7, borderRadius: 4,
    },
    statusText: {
        fontSize: 12, fontWeight: "700",
    },
});
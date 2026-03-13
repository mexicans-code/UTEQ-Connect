import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        paddingBottom: 24,
    },

    // ── Header ─────────────────────────────────────────────────────────────────
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
    },

    // ── Scroll ─────────────────────────────────────────────────────────────────
    scrollView: {
        paddingHorizontal: 16,
    },

    // ── Avatar / hero ──────────────────────────────────────────────────────────
    avatarSection: {
        alignItems: "center",
        paddingVertical: 24,
        gap: 8,
    },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    eventName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        textAlign: "center",
        marginTop: 4,
    },

    // Badge de estado (Próximo / En curso / Finalizado)
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },

    // Categoría tag
    cargoTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "#E8F0FE",
        borderRadius: 20,
    },
    cargoText: {
        fontSize: 13,
        color: "#4285F4",
        fontWeight: "600",
    },

    // ── Secciones ──────────────────────────────────────────────────────────────
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#3C3C3C",
    },
    infoText: {
        fontSize: 14,
        color: "#5F6368",
        lineHeight: 22,
        paddingLeft: 4,
    },

    // ── Botones de acción ──────────────────────────────────────────────────────
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4285F4",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 4,
        minWidth: 90,
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },

    // ── Coordenadas ────────────────────────────────────────────────────────────
    coordinatesSection: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 8,
    },
    coordinatesLabel: {
        fontSize: 11,
        color: "#aaa",
    },
    coordinatesText: {
        fontSize: 11,
        color: "#aaa",
        marginTop: 2,
    },
});
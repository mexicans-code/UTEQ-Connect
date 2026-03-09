import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    // ── Modal overlay ──────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(10, 15, 30, 0.55)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#F5F7FA",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: height * 0.92,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
        elevation: 30,
    },

    // ── Header ────────────────────────────────────────────────────────────
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#F0F2F5",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0A0F1E",
        letterSpacing: -0.2,
    },

    scrollView: {
        flex: 1,
    },

    // ── Avatar ────────────────────────────────────────────────────────────
    avatarSection: {
        alignItems: "center",
        paddingVertical: 28,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#EAF1FB",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1A73E8",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 10,
        borderWidth: 3,
        borderColor: "rgba(26,115,232,0.15)",
    },

    // ── Sections ──────────────────────────────────────────────────────────
    section: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 20,
        padding: 18,
        gap: 10,
        shadowColor: "#0A0F1E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#9AA0A6",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    // Person name / cargo
    personName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0A0F1E",
        letterSpacing: -0.4,
        lineHeight: 28,
        textAlign: "center",
    },
    cargoTag: {
        alignSelf: "center",
        backgroundColor: "#EAF1FB",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 4,
    },
    cargoText: {
        fontSize: 12,
        color: "#1A73E8",
        fontWeight: "700",
        textTransform: "capitalize",
        letterSpacing: 0.3,
    },
    employeeNumber: {
        fontSize: 12,
        color: "#9AA0A6",
        fontWeight: "500",
        textAlign: "center",
        letterSpacing: 0.3,
        marginTop: 2,
    },

    // Info text
    infoText: {
        fontSize: 14,
        color: "#3C4043",
        lineHeight: 21,
        fontWeight: "400",
    },

    // Contact items
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
    },
    contactText: {
        fontSize: 14,
        color: "#1A73E8",
        fontWeight: "500",
        textDecorationLine: "underline",
        textDecorationColor: "rgba(26,115,232,0.3)",
    },

    // Action buttons
    actionsContainer: {
        flexDirection: "row",
        gap: 10,
        marginHorizontal: 16,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#1A73E8",
        borderRadius: 18,
        paddingVertical: 14,
        shadowColor: "#1A73E8",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 7,
    },
    actionButtonText: {
        fontSize: 13,
        color: "#FFFFFF",
        fontWeight: "700",
        letterSpacing: 0.2,
    },

    // Coordinates
    coordinatesSection: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 32,
        backgroundColor: "#F0F2F5",
        borderRadius: 14,
        padding: 12,
        gap: 4,
    },
    coordinatesLabel: {
        fontSize: 11,
        color: "#9AA0A6",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    coordinatesText: {
        fontSize: 11.5,
        color: "#5F6368",
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        letterSpacing: 0.3,
    },
});
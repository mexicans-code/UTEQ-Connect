import { StyleSheet, Platform } from "react-native";

export const ACCENT = "#1A73E8";
export const GREEN  = "#34A853";

export const routeInfoSheetStyles = StyleSheet.create({
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.13,
        shadowRadius: 22,
        elevation: 22,
        zIndex: 90,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
    },
    handleWrap: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 4,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: "#E0E0E0",
        borderRadius: 2,
    },

    // ── Minimized
    minimizedRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    miniIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: ACCENT,
        justifyContent: "center",
        alignItems: "center",
    },
    miniIconActive: {
        backgroundColor: GREEN,
    },
    miniInfo: {
        flex: 1,
    },
    miniDest: {
        fontSize: 14,
        fontWeight: "700",
        color: "#202124",
    },
    miniStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    miniStat: {
        fontSize: 12,
        color: "#5F6368",
        fontWeight: "500",
    },
    miniDot: {
        fontSize: 12,
        color: "#BDC1C6",
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: GREEN,
    },

    // ── Expanded
    expandedContent: {
        paddingHorizontal: 20,
        paddingTop: 4,
        gap: 14,
    },
    destHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    destIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#EAF1FB",
        justifyContent: "center",
        alignItems: "center",
    },
    destInfo: {
        flex: 1,
    },
    destLabel: {
        fontSize: 11,
        color: "#9AA0A6",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    destName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#202124",
        letterSpacing: -0.2,
        marginTop: 1,
    },
    xBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F1F3F4",
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Stats row
    statsRow: {
        flexDirection: "row",
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        gap: 6,
    },
    statIcon: {
        width: 38,
        height: 38,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
    },
    statValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#202124",
        letterSpacing: -0.2,
        textAlign: "center",
    },
    statLabel: {
        fontSize: 11,
        color: "#9AA0A6",
        fontWeight: "500",
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 50,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 8,
    },

    // ── Recalculating banner
    recalcBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#FFF8E1",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#FFE082",
    },
    recalcText: {
        fontSize: 13,
        color: "#9A7D00",
        fontWeight: "600",
    },

    // ── Action buttons
    actions: {
        gap: 10,
    },
    startBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: ACCENT,
        paddingVertical: 15,
        borderRadius: 24,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
        elevation: 8,
        overflow: "hidden",
    },
    startBtnActive: {
        backgroundColor: GREEN,
        shadowColor: GREEN,
    },
    startBtnDisabled: {
        opacity: 0.6,
    },
    startBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    pulseRing: {
        position: "absolute",
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    secondaryRow: {
        flexDirection: "row",
        gap: 10,
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        backgroundColor: "#EAF1FB",
        paddingVertical: 12,
        borderRadius: 18,
    },
    secondaryBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: ACCENT,
    },
    closeSecondaryBtn: {
        backgroundColor: "#F1F3F4",
    },
});
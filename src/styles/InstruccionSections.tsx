import { StyleSheet, Platform } from "react-native";

export const ACCENT = "#003366";
export const GREEN  = "#34A853";

export const instructionsSection = StyleSheet.create({
    // ── Mini bar (navigating, collapsed)
    miniBar: {
        position: "absolute",
        top: Platform.OS === "ios" ? 120 : 104,
        left: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 10,
        zIndex: 150,
    },
    miniIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    miniText: {
        flex: 1,
    },
    miniDist: {
        fontSize: 18,
        fontWeight: "800",
        color: "#202124",
        letterSpacing: -0.5,
    },
    miniInstruction: {
        fontSize: 13,
        color: "#5F6368",
        marginTop: 1,
    },
    stepCounter: {
        backgroundColor: "#F1F3F4",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    stepCounterText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#5F6368",
    },

    // ── Float button (not navigating, list trigger)
    floatBtn: {
        position: "absolute",
        bottom: 180,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: ACCENT,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 150,
    },
    floatBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },

    // ── Expanded sheet
    expandedSheet: {
        position: "absolute",
        top: Platform.OS === "ios" ? 120 : 104,
        left: 12,
        right: 12,
        backgroundColor: "#fff",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 12,
        zIndex: 150,
        maxHeight: "55%",
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#F1F3F4",
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#202124",
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
    },
    progressTrack: {
        width: 120,
        height: 4,
        backgroundColor: "#F1F3F4",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: GREEN,
        borderRadius: 2,
    },
    progressLabel: {
        fontSize: 11,
        color: GREEN,
        fontWeight: "700",
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#F1F3F4",
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Steps list
    list: {
        paddingHorizontal: 18,
        paddingTop: 8,
    },
    stepRow: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 4,
    },

    // ── Timeline
    timelineCol: {
        alignItems: "center",
        width: 28,
        paddingTop: 4,
    },
    timelineDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#F1F3F4",
        borderWidth: 2,
        borderColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    timelineDotCurrent: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
    },
    timelineDotPast: {
        backgroundColor: GREEN,
        borderColor: GREEN,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        minHeight: 16,
        backgroundColor: "#E0E0E0",
        marginVertical: 2,
    },
    timelineLinePast: {
        backgroundColor: GREEN,
    },

    // ── Step content
    stepContent: {
        flex: 1,
        paddingBottom: 16,
        paddingTop: 4,
    },
    stepContentCurrent: {
        backgroundColor: "#F0F6FF",
        borderRadius: 14,
        padding: 12,
        marginBottom: 4,
    },
    stepTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    stepInstruction: {
        flex: 1,
        fontSize: 13,
        color: "#5F6368",
        lineHeight: 18,
        fontWeight: "500",
    },
    stepInstructionPast: {
        color: "#BDC1C6",
        textDecorationLine: "line-through",
    },
    stepInstructionCurrent: {
        color: "#202124",
        fontWeight: "700",
        fontSize: 14,
    },
    nowBadge: {
        backgroundColor: ACCENT,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    nowBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.3,
    },
    stepMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 5,
    },
    stepMetaText: {
        fontSize: 11,
        color: "#9AA0A6",
    },
    stepMetaDivider: {
        fontSize: 11,
        color: "#C5C8CE",
        marginHorizontal: 2,
    },
});
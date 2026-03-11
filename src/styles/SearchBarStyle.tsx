import { StyleSheet, Platform } from "react-native";

export const searchBarStyle = StyleSheet.create({
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
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#202124",
        fontWeight: "400",
        paddingVertical: 0,
    },
    clearBtn: {
        marginLeft: 8,
    },
    clearCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#BDC1C6",
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Category chips
    chipsRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 10,
        paddingHorizontal: 2,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    chipActive: {
        backgroundColor: "#003366",
    },
    chipLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#5F6368",
    },
    chipLabelActive: {
        color: "#fff",
    },

    // ── Dropdown
    dropdown: {
        backgroundColor: "#fff",
        borderRadius: 20,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 12,
        overflow: "hidden",
    },

    // ── Result rows
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#F1F3F4",
    },
    resultRowLast: {
        borderBottomWidth: 0,
    },
    resultIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    resultText: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#202124",
    },
    resultSub: {
        fontSize: 12,
        color: "#9AA0A6",
        marginTop: 2,
    },
    kindBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    kindLabel: {
        fontSize: 11,
        fontWeight: "700",
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 4,
    },
    sectionHeaderText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#9AA0A6",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    emptyRow: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 13,
        color: "#9AA0A6",
    },
    loadingRow: {
        padding: 16,
        alignItems: "center",
    },
});
import { StyleSheet, Platform, Dimensions } from "react-native";

const { height } = Dimensions.get("window");
const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1D356B",
    },

    // ── Header zona azul ─────────────────────────
    header: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === "ios" ? 56 : 36,
        paddingBottom: 70,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    headerLogo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    headerLogoText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 1.2,
    },
    headerLogoSubText: {
        color: "#9CC3FF",
        fontSize: 13,
        fontWeight: "500",
    },

    // ── Cuerpo blanco que ocupa el resto ──────────
    body: {
        flex: 1,
        backgroundColor: "#F4F6FA",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },

    bodyContent: {
        paddingBottom: 40,
    },
    avatarRow: {
        alignItems: "center",
        marginTop: -(AVATAR_SIZE / 2),
        marginBottom: 12,
    },
    avatarWrapper: {
        position: "relative",
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        shadowColor: "#1D356B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 10,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 4,
        borderColor: "#fff",
    },
    editAvatarButton: {
        position: "absolute",
        right: 1,
        bottom: 1,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#1D356B",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2.5,
        borderColor: "#fff",
        elevation: 9,
    },

    // ── Nombre y badge ────────────────────────────
    name: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "800",
        color: "#0F1F42",
        letterSpacing: 0.2,
    },
    badge: {
        alignSelf: "center",
        marginTop: 10,
        backgroundColor: "#1D356B",
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 1.3,
        textTransform: "uppercase",
    },

    // ── Info rows ────────────────────────────────
    infoSection: {
        marginTop: 24,
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 14,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F0F3FA",
    },
    infoIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#EEF2FB",
        alignItems: "center",
        justifyContent: "center",
    },
    infoTextGroup: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: "#A0A8BB",
        fontWeight: "600",
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    infoValue: {
        fontSize: 14,
        color: "#1A1F2E",
        fontWeight: "600",
        marginTop: 2,
    },

    // ── Botón logout ─────────────────────────────
    logoutButton: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#8B0F1A",
        paddingVertical: 15,
        borderRadius: 14,
        shadowColor: "#8B0F1A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.3,
    },

    // ── Boletos ───────────────────────────────────
    ticketsSection: {
        marginTop: 20,
        flex: 1,
    },

    // ── legacy (no borrar) ────────────────────────
    content: {},
    email: {},
    infoList: {},
    infoItem: {},
    scrollView: {},
    scrollContent: {},
    avatarContainer: {},
    bottomNav: {},
    navItem: {},
    navLabel: {},
    sectionTitle: {},
    sliderSection: {},
    sliderContent: {},
    destinationCard: {},
    firstCard: {},
    cardImageContainer: {},
    cardImage: {},
    cardImagePlaceholder: {},
    cardContent: {},
    cardTitle: {},
    cardButton: {},
    cardButtonText: {},
    pagination: {},
    dot: {},
    dotActive: {},
});

export default styles;
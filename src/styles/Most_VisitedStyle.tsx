import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 280;

export const styles = StyleSheet.create({
    // Sección principal
    sliderSection: {
        marginTop: 24,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
        paddingHorizontal: 16,
    },

    // ScrollView content
    sliderContent: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 8
    },

    // Tarjeta de destino
    destinationCard: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    firstCard: {
        marginLeft: 0,
    },

    // Imagen de la tarjeta
    cardImageContainer: {
        width: '100%',
        height: 160,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
    },

    cardImage: {
        width: '100%',
        height: '100%',
    },

    cardImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8e8e8',
    },

    // Contenido de la tarjeta
    cardContent: {
        padding: 12,
        gap: 10,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        lineHeight: 22,
    },

    // Botón
    cardButton: {
        backgroundColor: '#1e3a5f',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
    },

    cardButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },

    // Paginación (dots)
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },

    dotActive: {
        width: 20,
        backgroundColor: '#1e3a5f',
    },
});
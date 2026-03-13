
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 16,
        right: 16,
    },
    
    // Estilos minimizados
    minimizedContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    minimizedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    minimizedIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    minimizedTextContainer: {
        flex: 1,
    },
    minimizedDistance: {
        fontSize: 20,
        fontWeight: '700',
        color: '#202124',
        marginBottom: 4,
    },
    minimizedInstruction: {
        fontSize: 14,
        color: '#5F6368',
        lineHeight: 18,
    },

    // Estilos expandidos
    expandedContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        maxHeight: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8EAED',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#202124',
    },
    stepsList: {
        padding: 12,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F8F9FA',
    },
    currentStepItem: {
        backgroundColor: '#E8F0FE',
        borderWidth: 2,
        borderColor: '#4285F4',
    },
    pastStepItem: {
        opacity: 0.6,
    },
    stepIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    currentStepIcon: {
        backgroundColor: '#4285F4',
    },
    pastStepIcon: {
        backgroundColor: '#E8EAED',
    },
    stepContent: {
        flex: 1,
    },
    stepInstruction: {
        fontSize: 14,
        lineHeight: 20,
        color: '#202124',
        fontWeight: '500',
        marginBottom: 6,
    },
    pastStepText: {
        color: '#9AA0A6',
    },
    stepMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    stepDistance: {
        fontSize: 12,
        color: '#5F6368',
        fontWeight: '600',
    },
    stepDivider: {
        fontSize: 12,
        color: '#DDD',
    },
    stepDuration: {
        fontSize: 12,
        color: '#5F6368',
    },
    currentBadge: {
        backgroundColor: '#4285F4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    currentBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: 'white',
    },

    // Botón flotante
    floatingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4285F4',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        shadowColor: '#4285F4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
        alignSelf: 'flex-start',
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
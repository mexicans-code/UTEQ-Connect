import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Coordinates } from "../../types";
import { calcularDistancia } from "../../utils/geoUtils";
import { styles } from "../../styles/InstruccionSections";

interface Step {
    html_instructions: string;
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    maneuver?: string;
    start_location: {
        lat: number;
        lng: number;
    };
}

interface InstructionsSectionProps {
    steps: Step[];
    currentLocation?: Coordinates | null;
    isNavigating?: boolean;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ 
    steps, 
    currentLocation,
    isNavigating = false 
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Actualizar paso actual basado en ubicación
    useEffect(() => {
        if (!currentLocation || !isNavigating || steps.length === 0) return;

        // Encontrar el paso más cercano a la ubicación actual
        let closestStepIndex = 0;
        let minDistance = Infinity;

        steps.forEach((step, index) => {
            const stepCoords: Coordinates = {
                latitude: step.start_location.lat,
                longitude: step.start_location.lng
            };

            const distance = calcularDistancia(currentLocation, stepCoords);

            if (distance < minDistance) {
                minDistance = distance;
                closestStepIndex = index;
            }
        });

        setCurrentStepIndex(closestStepIndex);
    }, [currentLocation, steps, isNavigating]);

    if (!steps || steps.length === 0) {
        return null;
    }

    // Limpiar instrucciones HTML
    const cleanInstruction = (html: string): string => {
        return html
            .replace(/<div[^>]*>/gi, ' ')
            .replace(/<\/div>/gi, '')
            .replace(/<b>/gi, '')
            .replace(/<\/b>/gi, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/<[^>]+>/g, '')
            .trim();
    };

    // Obtener ícono según maniobra
    const getManeuverIcon = (maneuver?: string): string => {
        if (!maneuver) return 'arrow-up';
        
        const maneuverIcons: { [key: string]: string } = {
            'turn-right': 'arrow-forward',
            'turn-left': 'arrow-back',
            'turn-slight-right': 'trending-up',
            'turn-slight-left': 'trending-down',
            'turn-sharp-right': 'return-up-forward',
            'turn-sharp-left': 'return-up-back',
            'keep-right': 'arrow-forward',
            'keep-left': 'arrow-back',
            'uturn-right': 'return-down-forward',
            'uturn-left': 'return-down-back',
            'straight': 'arrow-up',
            'roundabout-right': 'sync',
            'roundabout-left': 'sync',
        };

        return maneuverIcons[maneuver] || 'arrow-up';
    };

    // Paso actual
    const currentStep = steps[currentStepIndex];

    return (
        <View style={styles.container}>
            {/* Vista minimizada - Instrucción actual */}
            {!isExpanded && isNavigating && (
                <TouchableOpacity 
                    style={styles.minimizedContainer}
                    onPress={() => setIsExpanded(true)}
                    activeOpacity={0.9}
                >
                    <View style={styles.minimizedContent}>
                        <View style={styles.minimizedIconContainer}>
                            <Ionicons 
                                name={getManeuverIcon(currentStep.maneuver) as any} 
                                size={32} 
                                color="white" 
                            />
                        </View>
                        <View style={styles.minimizedTextContainer}>
                            <Text style={styles.minimizedDistance}>
                                {currentStep.distance.text}
                            </Text>
                            <Text style={styles.minimizedInstruction} numberOfLines={2}>
                                {cleanInstruction(currentStep.html_instructions)}
                            </Text>
                        </View>
                        <Ionicons name="chevron-up" size={24} color="#5F6368" />
                    </View>
                </TouchableOpacity>
            )}

            {/* Vista expandida - Todas las instrucciones */}
            {isExpanded && (
                <View style={styles.expandedContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            Indicaciones ({steps.length} pasos)
                        </Text>
                        <TouchableOpacity onPress={() => setIsExpanded(false)}>
                            <Ionicons name="chevron-down" size={24} color="#5F6368" />
                        </TouchableOpacity>
                    </View>

                    {/* Lista de pasos */}
                    <ScrollView 
                        style={styles.stepsList}
                        showsVerticalScrollIndicator={false}
                    >
                        {steps.map((step, index) => {
                            const isCurrentStep = index === currentStepIndex && isNavigating;
                            const isPastStep = index < currentStepIndex && isNavigating;

                            return (
                                <View 
                                    key={index}
                                    style={[
                                        styles.stepItem,
                                        isCurrentStep && styles.currentStepItem,
                                        isPastStep && styles.pastStepItem
                                    ]}
                                >
                                    {/* Icono de maniobra */}
                                    <View style={[
                                        styles.stepIconContainer,
                                        isCurrentStep && styles.currentStepIcon,
                                        isPastStep && styles.pastStepIcon
                                    ]}>
                                        <Ionicons 
                                            name={getManeuverIcon(step.maneuver) as any}
                                            size={24} 
                                            color={isCurrentStep ? 'white' : isPastStep ? '#9AA0A6' : '#4285F4'} 
                                        />
                                    </View>

                                    {/* Contenido del paso */}
                                    <View style={styles.stepContent}>
                                        <Text style={[
                                            styles.stepInstruction,
                                            isPastStep && styles.pastStepText
                                        ]}>
                                            {cleanInstruction(step.html_instructions)}
                                        </Text>
                                        <View style={styles.stepMeta}>
                                            <Text style={styles.stepDistance}>
                                                {step.distance.text}
                                            </Text>
                                            <Text style={styles.stepDivider}>•</Text>
                                            <Text style={styles.stepDuration}>
                                                {step.duration.text}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Indicador de paso actual */}
                                    {isCurrentStep && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>Ahora</Text>
                                        </View>
                                    )}

                                    {/* Check para pasos completados */}
                                    {isPastStep && (
                                        <Ionicons name="checkmark-circle" size={20} color="#34A853" />
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Botón flotante para expandir cuando está minimizado */}
            {!isExpanded && !isNavigating && steps.length > 0 && (
                <TouchableOpacity 
                    style={styles.floatingButton}
                    onPress={() => setIsExpanded(true)}
                >
                    <Ionicons name="list" size={24} color="white" />
                    <Text style={styles.floatingButtonText}>
                        Ver {steps.length} pasos
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

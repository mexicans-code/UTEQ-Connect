import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Coordinates } from "../../types";
import { calcularDistancia } from "../../utils/geoUtils";
import { instructionsSection as styles, ACCENT, GREEN } from "../../styles/InstruccionSections";

interface Step {
    html_instructions: string;
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    maneuver?: string;
    start_location: { lat: number; lng: number };
}

interface InstructionsSectionProps {
    steps: Step[];
    currentLocation?: Coordinates | null;
    isNavigating?: boolean;
}

const MANEUVER_ICONS: Record<string, { name: string; color: string; bg: string }> = {
    "turn-right":        { name: "arrow-forward",      color: "#003366", bg: "#EAF1FB" },
    "turn-left":         { name: "arrow-back",         color: "#003366", bg: "#EAF1FB" },
    "turn-slight-right": { name: "trending-up",        color: "#34A853", bg: "#E8F5E9" },
    "turn-slight-left":  { name: "trending-down",      color: "#34A853", bg: "#E8F5E9" },
    "turn-sharp-right":  { name: "return-up-forward",  color: "#F57C00", bg: "#FFF3E0" },
    "turn-sharp-left":   { name: "return-up-back",     color: "#F57C00", bg: "#FFF3E0" },
    "keep-right":        { name: "arrow-forward",      color: "#003366", bg: "#EAF1FB" },
    "keep-left":         { name: "arrow-back",         color: "#003366", bg: "#EAF1FB" },
    "uturn-right":       { name: "return-down-forward",color: "#EA4335", bg: "#FDEEEC" },
    "uturn-left":        { name: "return-down-back",   color: "#EA4335", bg: "#FDEEEC" },
    "straight":          { name: "arrow-up",           color: "#5F6368", bg: "#F1F3F4" },
    "roundabout-right":  { name: "sync",               color: "#9C27B0", bg: "#F3E5F5" },
    "roundabout-left":   { name: "sync",               color: "#9C27B0", bg: "#F3E5F5" },
};
const DEFAULT_ICON = { name: "arrow-up", color: "#5F6368", bg: "#F1F3F4" };

const getIcon = (maneuver?: string) =>
    maneuver ? MANEUVER_ICONS[maneuver] ?? DEFAULT_ICON : DEFAULT_ICON;

const cleanInstruction = (html: string) =>
    html.replace(/<div[^>]*>/gi, " ").replace(/<\/div>/gi, "")
        .replace(/<\/?b>/gi, "").replace(/&nbsp;/gi, " ")
        .replace(/<[^>]+>/g, "").trim();

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({
    steps, currentLocation, isNavigating = false,
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isExpanded, setIsExpanded]             = useState(false);

    useEffect(() => {
        if (!currentLocation || !isNavigating || !steps.length) return;
        let minDist = Infinity, closest = 0;
        steps.forEach((step, i) => {
            const d = calcularDistancia(currentLocation, {
                latitude: step.start_location.lat,
                longitude: step.start_location.lng,
            });
            if (d < minDist) { minDist = d; closest = i; }
        });
        setCurrentStepIndex(closest);
    }, [currentLocation, steps, isNavigating]);

    if (!steps?.length) return null;

    const currentStep = steps[currentStepIndex];
    const icon        = getIcon(currentStep.maneuver);
    const progress    = Math.round((currentStepIndex / steps.length) * 100);

    // ── Minimized bar ──────────────────────────────────────────────────────────
    if (!isExpanded && isNavigating) {
        return (
            <TouchableOpacity style={styles.miniBar} onPress={() => setIsExpanded(true)} activeOpacity={0.9}>
                <View style={[styles.miniIconWrap, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                </View>
                <View style={styles.miniText}>
                    <Text style={styles.miniDist}>{currentStep.distance.text}</Text>
                    <Text style={styles.miniInstruction} numberOfLines={1}>
                        {cleanInstruction(currentStep.html_instructions)}
                    </Text>
                </View>
                <View style={styles.stepCounter}>
                    <Text style={styles.stepCounterText}>{currentStepIndex + 1}/{steps.length}</Text>
                </View>
                <Ionicons name="chevron-up" size={18} color="#9AA0A6" />
            </TouchableOpacity>
        );
    }

    // ── Float button ───────────────────────────────────────────────────────────
    if (!isExpanded && !isNavigating) {
        return (
            <TouchableOpacity style={styles.floatBtn} onPress={() => setIsExpanded(true)} activeOpacity={0.85}>
                <Ionicons name="list" size={18} color="#fff" />
                <Text style={styles.floatBtnText}>{steps.length} pasos</Text>
            </TouchableOpacity>
        );
    }

    // ── Expanded ───────────────────────────────────────────────────────────────
    return (
        <View style={styles.expandedSheet}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Indicaciones</Text>
                    {isNavigating && (
                        <View style={styles.progressRow}>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
                            </View>
                            <Text style={styles.progressLabel}>{progress}%</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setIsExpanded(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-down" size={20} color="#5F6368" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}>
                {steps.map((step, index) => {
                    const isCurrent = index === currentStepIndex && isNavigating;
                    const isPast    = index < currentStepIndex && isNavigating;
                    const stepIcon  = getIcon(step.maneuver);

                    return (
                        <View key={index} style={styles.stepRow}>
                            {/* Timeline */}
                            <View style={styles.timelineCol}>
                                <View style={[
                                    styles.timelineDot,
                                    isCurrent && styles.timelineDotCurrent,
                                    isPast    && styles.timelineDotPast,
                                ]}>
                                    {isPast ? (
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    ) : (
                                        <Ionicons name={stepIcon.name as any} size={12}
                                            color={isCurrent ? "#fff" : "#9AA0A6"} />
                                    )}
                                </View>
                                {index < steps.length - 1 && (
                                    <View style={[styles.timelineLine, isPast && styles.timelineLinePast]} />
                                )}
                            </View>

                            {/* Content */}
                            <View style={[styles.stepContent, isCurrent && styles.stepContentCurrent]}>
                                <View style={styles.stepTopRow}>
                                    <Text style={[
                                        styles.stepInstruction,
                                        isPast    && styles.stepInstructionPast,
                                        isCurrent && styles.stepInstructionCurrent,
                                    ]} numberOfLines={2}>
                                        {cleanInstruction(step.html_instructions)}
                                    </Text>
                                    {isCurrent && (
                                        <View style={styles.nowBadge}>
                                            <Text style={styles.nowBadgeText}>Ahora</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.stepMeta}>
                                    <Ionicons name="footsteps-outline" size={12} color="#9AA0A6" />
                                    <Text style={styles.stepMetaText}>{step.distance.text}</Text>
                                    <Text style={styles.stepMetaDivider}>·</Text>
                                    <Ionicons name="time-outline" size={12} color="#9AA0A6" />
                                    <Text style={styles.stepMetaText}>{step.duration.text}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};
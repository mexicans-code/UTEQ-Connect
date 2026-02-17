import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "../../styles/LocationInformationStyle";

interface LocationInformationProps {
    location?: {
        nombre: string;
        direccion?: string;
        telefono?: string;
        horario?: string;
        sitioWeb?: string;
        calificacion?: number;
        totalResenas?: number;
        descripcion?: string;
        tipo?: string;
        fotos?: string[];
        posicion?: {
            latitude: number;
            longitude: number;
        };
    } | null;
    onClose: () => void;
}

const LocationInformation: React.FC<LocationInformationProps> = ({ location, onClose }) => {
    if (!location) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#5F6368" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Información del lugar</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>No hay información disponible</Text>
                </View>
            </View>
        );
    }

    const handleCallPress = () => {
        if (location.telefono) {
            Linking.openURL(`tel:${location.telefono}`);
        }
    };

    const handleWebsitePress = () => {
        if (location.sitioWeb) {
            Linking.openURL(location.sitioWeb);
        }
    };

    const handleDirectionsPress = () => {
        if (location.posicion) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${location.posicion.latitude},${location.posicion.longitude}`;
            Linking.openURL(url);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={16} color="#FBBC04" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={16} color="#FBBC04" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FBBC04" />);
            }
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#5F6368" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Información del lugar</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {location.fotos && location.fotos.length > 0 && (
                    <ScrollView
                        horizontal
                        style={styles.photosContainer}
                        showsHorizontalScrollIndicator={false}
                    >
                        {location.fotos.map((foto, index) => (
                            <Image
                                key={index}
                                source={{ uri: foto }}
                                style={styles.photo}
                            />
                        ))}
                    </ScrollView>
                )}

                <View style={styles.section}>
                    <Text style={styles.placeName}>{location.nombre}</Text>
                    {location.tipo && (
                        <View style={styles.typeTag}>
                            <Text style={styles.typeText}>{location.tipo}</Text>
                        </View>
                    )}
                </View>

                {location.calificacion && (
                    <View style={styles.ratingSection}>
                        <View style={styles.starsContainer}>
                            {renderStars(location.calificacion)}
                        </View>
                        <Text style={styles.ratingText}>
                            {location.calificacion.toFixed(1)}
                        </Text>
                        {location.totalResenas && (
                            <Text style={styles.reviewsText}>
                                ({location.totalResenas} reseñas)
                            </Text>
                        )}
                    </View>
                )}

                {location.descripcion && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <Text style={styles.descriptionText}>{location.descripcion}</Text>
                    </View>
                )}

                {location.direccion && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Dirección</Text>
                        </View>
                        <Text style={styles.infoText}>{location.direccion}</Text>
                    </View>
                )}

                {location.horario && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Horario</Text>
                        </View>
                        <Text style={styles.infoText}>{location.horario}</Text>
                    </View>
                )}

                <View style={styles.actionsContainer}>
                    {location.telefono && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleCallPress}
                        >
                            <Ionicons name="call" size={24} color="#4285F4" />
                            <Text style={styles.actionButtonText}>Llamar</Text>
                        </TouchableOpacity>
                    )}

                    {location.sitioWeb && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleWebsitePress}
                        >
                            <Ionicons name="globe" size={24} color="#4285F4" />
                            <Text style={styles.actionButtonText}>Sitio web</Text>
                        </TouchableOpacity>
                    )}

                    {location.posicion && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleDirectionsPress}
                        >
                            <Ionicons name="navigate" size={24} color="#4285F4" />
                            <Text style={styles.actionButtonText}>Cómo llegar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {location.posicion && (
                    <View style={styles.coordinatesSection}>
                        <Text style={styles.coordinatesText}>
                            Lat: {location.posicion.latitude.toFixed(6)}, Lng: {location.posicion.longitude.toFixed(6)}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default LocationInformation;
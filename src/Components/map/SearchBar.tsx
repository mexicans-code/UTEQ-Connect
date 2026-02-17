import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Location, PersonData } from "../../types";
import { getLocations } from "../../api/locations";
import { API_URL } from "../../api/config";
import axios from "axios";
import styles from "../../styles/SearchBar";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSelectLocation?: (location: Location, personData?: PersonData) => void;
};

type SearchResult = {
  id: string;
  type: 'location' | 'person';
  displayName: string;
  location: Location;
  subtitle?: string;
  personData?: PersonData;
};

const SearchBar = ({ value, onChange, onSelectLocation }: Props) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    const searchEverything = async () => {
      if (value.trim().length > 0) {
        setLoading(true);
        const results: SearchResult[] = [];

        // 1. Buscar en ubicaciones locales
        const filteredLocations = locations.filter(loc =>
          loc.nombre.toLowerCase().includes(value.toLowerCase())
        );

        filteredLocations.forEach(loc => {
          results.push({
            id: `loc-${loc._id}`,
            type: 'location',
            displayName: loc.nombre,
            location: loc
          });
        });

        // 2. Buscar personal en la API
        try {
          const response = await axios.get(
            `${API_URL}/personal/buscar?q=${encodeURIComponent(value)}`,
            { timeout: 5000 }
          );

          if (response.data.success && response.data.data) {
            response.data.data.forEach((persona: any) => {
              // Solo agregar si tiene ubicación
              if (persona.ubicacion && persona.ubicacion.coordenadas) {
                const personLocation: Location = {
                  _id: `person-${persona.numeroEmpleado}`,
                  nombre: persona.ubicacion.nombre,
                  posicion: {
                    latitude: persona.ubicacion.coordenadas.latitude,
                    longitude: persona.ubicacion.coordenadas.longitude
                  }
                };

                const personData: PersonData = {
                  numeroEmpleado: persona.numeroEmpleado,
                  nombreCompleto: persona.nombreCompleto,
                  email: persona.email,
                  telefono: persona.telefono,
                  cargo: persona.cargo,
                  departamento: persona.departamento,
                  cubiculo: persona.cubiculo,
                  planta: persona.planta,
                  ubicacion: persona.ubicacion
                };

                results.push({
                  id: `person-${persona.numeroEmpleado}`,
                  type: 'person',
                  displayName: persona.nombreCompleto,
                  subtitle: `${persona.cargo} - ${persona.departamento}`,
                  location: personLocation,
                  personData: personData
                });
              }
            });
          }
        } catch (error: any) {
          console.error('Error buscando personal:', error.message);
        }

        setSearchResults(results);
        setShowSuggestions(results.length > 0);
        setLoading(false);
      } else {
        setShowSuggestions(false);
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchEverything, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, locations]);

  const handleSelect = (result: SearchResult) => {
    onChange(result.displayName);
    setShowSuggestions(false);

    console.log('Selección:', {
      tipo: result.type,
      nombre: result.displayName,
      ubicacion: result.location.nombre,
      coordenadas: result.location.posicion
    });

    onSelectLocation?.(result.location, result.personData);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialIcons name="search" size={24} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Buscar lugar o persona..."
          value={value}
          onChangeText={onChange}
          style={styles.input}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <MaterialIcons
                  name={item.type === 'person' ? 'person' : 'place'}
                  size={20}
                  color={item.type === 'person' ? '#4285F4' : '#666'}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.suggestionText}>{item.displayName}</Text>
                  {item.subtitle && (
                    <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;
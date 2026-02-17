import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Location } from "../../types";
import { getLocations } from "../../api/locations";
import styles from "../../styles/SearchBar";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSelectLocation?: (location: Location) => void;
};

const SearchBar = ({ value, onChange, onSelectLocation }: Props) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    if (value.trim().length > 0) {
      const filtered = locations.filter(loc =>
        loc.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, locations]);

  const handleSelect = (location: Location) => {
    onChange(location.nombre);
    setShowSuggestions(false);

    console.log("Ubicación seleccionada:", {
      nombre: location.nombre,
      latitude: location.posicion.latitude,
      longitude: location.posicion.longitude
    });

    onSelectLocation?.(location);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialIcons name="search" size={24} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Buscar lugar..."
          value={value}
          onChangeText={onChange}
          style={styles.input}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange("")}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <MaterialIcons name="place" size={20} color="#666" />
                <Text style={styles.suggestionText}>{item.nombre}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;

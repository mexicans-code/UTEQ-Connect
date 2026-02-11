import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/IndexStyle';

const Index = ({ navigation }: { navigation: any }) => {
  return (
    <ImageBackground
      source={{
        uri: 'https://www.uteq.edu.mx/Images/talentosA1.jpg',
      }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="map-marker-check" size={40} color="#fff" />
          </View>
          <Text style={styles.logoText}>UTEQ</Text>
          <Text style={styles.logoSubText}>Connect</Text>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <Text style={styles.title}>Inicio de Sesión</Text>

          {/* Botón Inicio de Sesión */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log('Navegando a Login');
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.buttonText}>Inicio de Sesión</Text>
          </TouchableOpacity>

          {/* Botón Registro */}
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => {
              console.log('Navegando a Register');
              navigation.navigate('Register');
            }}
          >
            <Text style={styles.buttonSecondaryText}>Registro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Index;

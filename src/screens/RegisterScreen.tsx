import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/RegisterScreenStyle';

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'alumno' | 'visitante' | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con botón back */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#0066CC" />
            <Text style={styles.backText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        {/* Logo pequeño */}
        <View style={styles.miniLogoContainer}>
          <View style={styles.miniLogo}>
            <MaterialCommunityIcons name="map-marker-check" size={32} color="#fff" />
          </View>
          <Text style={styles.logoText}>UTEQ Connect</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Nombre y Apellidos */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE Y APELLIDOS</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez García"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRONICO</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Tipo de Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOSE</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setUserType('alumno')}
              >
                <View style={[styles.radioCircle, userType === 'alumno' && styles.radioSelected]}>
                  {userType === 'alumno' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Alumno</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setUserType('visitante')}
              >
                <View style={[styles.radioCircle, userType === 'visitante' && styles.radioSelected]}>
                  {userType === 'visitante' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Visitante</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.submitButtonText}>Registrar</Text>
          </TouchableOpacity>

          {/* Botón Ya tienes cuenta */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

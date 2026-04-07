import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/LoginScreenStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/config';
import * as LocalAuthentication from 'expo-local-authentication';

interface Props {
  navigation: any;
  setIsLoggedIn: (value: boolean) => void;
}

// ── Validadores ───────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

const validateEmail = (value: string): string | null => {
  if (!value.trim()) return 'El correo es obligatorio';
  if (!emailRegex.test(value)) return 'Ingresa un correo válido (ej: usuario@gmail.com)';
  return null;
};

const validatePassword = (value: string): string | null => {
  if (!value) return 'La contraseña es obligatoria';
  if (!passwordRegex.test(value))
    return 'Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&._-#)';
  return null;
};

const LoginScreen = ({ navigation, setIsLoggedIn }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Errores en tiempo real
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricUser = await AsyncStorage.getItem('biometricUser');
    setBiometricAvailable(compatible && enrolled && !!biometricUser);
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Inicia sesión con tu huella',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
    });

    if (result.success) {
      try {
        const biometricUser = await AsyncStorage.getItem('biometricUser');
        if (!biometricUser) { Alert.alert('Error', 'No hay sesión biométrica guardada'); return; }

        const response = await fetch(`${API_URL}/auth/biometric-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: biometricUser }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const user = data.data.user;
          const token = data.data.token;
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userId', user._id);
          await AsyncStorage.setItem('userEmail', user.email);
          await AsyncStorage.setItem('userName', user.nombre);
          await AsyncStorage.setItem('userRol', user.rol);
          setIsLoggedIn(true);
          navigation.replace('MainTabs');
        } else {
          Alert.alert('Error', data.error || 'Error al iniciar sesión');
        }
      } catch {
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor');
      }
    } else {
      Alert.alert('Error', 'No se pudo verificar tu identidad');
    }
  };

  const handleLogin = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.data.user;
        const token = data.data.token;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', user._id);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userName', user.nombre);
        await AsyncStorage.setItem('userRol', user.rol);
        await AsyncStorage.setItem('biometricUser', user.email);
        setIsLoggedIn(true);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', data.error || 'Error al iniciar sesión');
      }
    } catch {
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#0066CC" />
            <Text style={styles.backText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.miniLogoContainer}>
          <View style={styles.miniLogo}>
            <MaterialCommunityIcons name="map-marker-check" size={32} color="#fff" />
          </View>
          <Text style={styles.logoText}>UTEQ Connect</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={[styles.input, emailError ? { borderColor: '#ef4444', borderWidth: 1 } : {}]}
              placeholder="tu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(validateEmail(v)); }}
              onBlur={() => setEmailError(validateEmail(email))}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {emailError && (
              <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{emailError}</Text>
            )}
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, passwordError ? { borderColor: '#ef4444', borderWidth: 1 } : {}]}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError(validatePassword(v)); }}
                onBlur={() => setPasswordError(validatePassword(password))}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 15, top: 15 }}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.continueButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>Continuar</Text>}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={{ alignItems: 'center', marginTop: 20, padding: 12 }}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <MaterialCommunityIcons name="fingerprint" size={48} color="#0066CC" />
              <Text style={{ color: '#0066CC', marginTop: 6, fontSize: 14 }}>Iniciar con huella</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
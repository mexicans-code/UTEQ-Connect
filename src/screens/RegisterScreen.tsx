import React, { useState } from 'react';
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
import styles from '../styles/RegisterScreenStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/config';

// ── Validadores ───────────────────────────────────────────────
const NAME_MAX = 35;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

const validateName = (v: string): string | null => {
  if (!v.trim()) return 'El nombre es obligatorio';
  if (v.trim().length > NAME_MAX) return `Máximo ${NAME_MAX} caracteres`;
  return null;
};

const validateEmail = (v: string): string | null => {
  if (!v.trim()) return 'El correo es obligatorio';
  if (!emailRegex.test(v)) return 'Ingresa un correo válido (ej: usuario@gmail.com)';
  return null;
};

const validatePassword = (v: string): string | null => {
  if (!v) return 'La contraseña es obligatoria';
  if (!passwordRegex.test(v))
    return 'Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&._-#)';
  return null;
};

const validateConfirm = (v: string, password: string): string | null => {
  if (!v) return 'Confirma tu contraseña';
  if (v !== password) return 'Las contraseñas no coinciden';
  return null;
};

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'alumno' | 'visitante' | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errores en tiempo real
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleRegister = async () => {
    // Validar todos los campos
    const nErr = validateName(fullName);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirm(confirmPassword, password);

    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmError(cErr);

    if (nErr || eErr || pErr || cErr) return;

    if (!userType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de usuario');
      return;
    }

    setLoading(true);

    const requestBody = {
      nombre: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    const url = `${API_URL}/auth/register`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        Alert.alert('Error del Servidor', `Respuesta inesperada:\n${text.substring(0, 200)}`);
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        const user = data.data.user;
        const token = data.data.token;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userToken', user._id);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userName', user.nombre);
        await AsyncStorage.setItem('userRol', user.rol);

        Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada correctamente', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error al Registrar', data.error || data.message || 'Error al crear la cuenta');
      }
    } catch (error: any) {
      Alert.alert('Error de Conexión', `No se pudo conectar con el servidor.\n\nVerifica:\n1. El servidor está corriendo\n2. Tu conexión a internet`);
    } finally {
      setLoading(false);
    }
  };

  // Helper para renderizar campo con error
  const ErrorText = ({ msg }: { msg: string | null }) =>
    msg ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{msg}</Text> : null;

  const inputStyle = (err: string | null) => [
    styles.input,
    err ? { borderColor: '#ef4444', borderWidth: 1 } : {},
  ];

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
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>NOMBRE Y APELLIDOS</Text>
              <Text style={{ fontSize: 12, color: fullName.length > NAME_MAX ? '#ef4444' : '#999' }}>
                {fullName.length}/{NAME_MAX}
              </Text>
            </View>
            <TextInput
              style={inputStyle(nameError)}
              placeholder="Nombre Completo"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={(v) => {
                if (v.length <= NAME_MAX) setFullName(v);
                if (nameError) setNameError(validateName(v));
              }}
              onBlur={() => setNameError(validateName(fullName))}
              maxLength={NAME_MAX}
              editable={!loading}
            />
            <ErrorText msg={nameError} />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={inputStyle(emailError)}
              placeholder="tu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(validateEmail(v)); }}
              onBlur={() => setEmailError(validateEmail(email))}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <ErrorText msg={emailError} />
          </View>

          {/* Tipo de Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Usuario</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioOption} onPress={() => setUserType('alumno')} disabled={loading}>
                <View style={[styles.radioCircle, userType === 'alumno' && styles.radioSelected]}>
                  {userType === 'alumno' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Alumno</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => setUserType('visitante')} disabled={loading}>
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
            <View style={{ position: 'relative' }}>
              <TextInput
                style={inputStyle(passwordError)}
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
            <ErrorText msg={passwordError} />
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={inputStyle(confirmError)}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); if (confirmError) setConfirmError(validateConfirm(v, password)); }}
                onBlur={() => setConfirmError(validateConfirm(confirmPassword, password))}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 15, top: 15 }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <MaterialCommunityIcons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ErrorText msg={confirmError} />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Registrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')} disabled={loading}>
            <Text style={styles.loginButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
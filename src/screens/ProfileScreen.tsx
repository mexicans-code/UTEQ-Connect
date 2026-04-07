import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, AppState } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { io, Socket } from "socket.io-client";
import styles from "../styles/ProfileScreenStyle";
import EventTicketSection from "../Components/profile/EventTicketSection";
import { API_URL } from "../api/config";

// 🔧 Helper: obtiene las iniciales del nombre completo
const getInitials = (name: string | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// 🎨 Helper: color de fondo basado en el nombre (consistente por usuario)
const getAvatarColor = (name: string | null): { bg: string; text: string } => {
  const colors = [
    { bg: "#B5D4F4", text: "#0C447C" },
    { bg: "#9FE1CB", text: "#0F6E56" },
    { bg: "#F4C0D1", text: "#72243E" },
    { bg: "#CECBF6", text: "#3C3489" },
    { bg: "#FAC775", text: "#633806" },
    { bg: "#C0DD97", text: "#27500A" },
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const ProfileScreen = ({ navigation, setIsLoggedIn }: {
  navigation: any;
  setIsLoggedIn: (value: boolean) => void;
}) => {
  const [userData, setUserData] = React.useState<{
    token: string | null;
    userName: string | null;
    userEmail: string | null;
  } | null>(null);

  const [ticketRefreshKey, setTicketRefreshKey] = React.useState(0);
  const refreshTickets = () => setTicketRefreshKey((k) => k + 1);

  useFocusEffect(
    React.useCallback(() => {
      getDataFromStorage();
      refreshTickets();
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        getDataFromStorage();
        refreshTickets();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const socket: Socket = io(API_URL.replace("/api", ""), {
      transports: ["websocket"],
    });

    socket.on("ticket_created", () => refreshTickets());
    socket.on("ticket_updated", () => refreshTickets());
    socket.on("ticket_scanned", () => refreshTickets());
    socket.on("event_created", () => { getDataFromStorage(); refreshTickets(); });
    socket.on("event_updated", () => { getDataFromStorage(); refreshTickets(); });
    socket.on("event_deleted", () => { getDataFromStorage(); refreshTickets(); });

    return () => { socket.disconnect(); };
  }, []);

  const getDataFromStorage = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const userName = await AsyncStorage.getItem("userName");
    const userEmail = await AsyncStorage.getItem("userEmail");
    setUserData({ token, userName, userEmail });

    if (token) {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          await AsyncStorage.setItem("userName", data.data.nombre);
          await AsyncStorage.setItem("userEmail", data.data.email);
          setUserData({ token, userName: data.data.nombre, userEmail: data.data.email });
        }
      } catch (_) {}
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      "userToken", "userId", "userEmail", "userName", "userRol",
    ]);
    setIsLoggedIn(false);
    navigation.navigate("Index");
  };

  const initials = getInitials(userData?.userName ?? null);
  const avatarColor = getAvatarColor(userData?.userName ?? null);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.headerLogo}>
          <MaterialCommunityIcons name="map-marker-check" size={18} color="#fff" />
          <Text style={styles.headerLogoText}>UTEQ</Text>
          <Text style={styles.headerLogoSubText}>Connect</Text>
        </View>
      </View>

      <View style={styles.body}>

        {/* Avatar de iniciales */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: avatarColor.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                },
              ]}
            >
              <Text style={{ fontSize: 26, fontWeight: "600", color: avatarColor.text }}>
                {initials}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.name}>{userData?.userName ?? "—"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Alumno</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="email-outline" size={19} color="#1D356B" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{userData?.userEmail ?? "—"}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#fff" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={styles.ticketsSection}>
            <EventTicketSection key={ticketRefreshKey} />
          </View>
        </ScrollView>

      </View>
    </View>
  );
};

export default ProfileScreen;
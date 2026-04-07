import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../../styles/CalendarStyles';

import { API_URL } from "../../api/config";
const SOCKET_URL = API_URL.replace("/api", "");

const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS_ES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const EVENT_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#06b6d4', '#eab308'];

interface Event {
    _id: string;
    titulo: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    destino?: { nombre: string };
    cuposDisponibles: number;
    cupos: number;
    activo: boolean;
}

interface CalendarSectionProps {
    onEventPress?: (event: Event) => void;
    onVerTodos?: () => void;
}

const CalendarSection = ({ onEventPress, onVerTodos }: CalendarSectionProps) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const fetchRef = useRef<(() => Promise<void>) | undefined>(undefined);

    // useFocusEffect — conecta socket cuando la pantalla está visible
    // y lo desconecta cuando pierde foco (usuario cambia de tab)
    useFocusEffect(
        useCallback(() => {
            const fetchEvents = async () => {
                try {
                    const res = await axios.get(`${API_URL}/events/active`);
                    setEvents(res.data.data || []);
                } catch {
                    setEvents([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchRef.current = fetchEvents;
            fetchEvents();

            console.log('CalendarSection Socket: conectando...');
            const socket: Socket = io(SOCKET_URL, {
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
            });

            socket.on('connect', () => {
                console.log('CalendarSection Socket: conectado ✅', socket.id);
            });

            socket.on('event_created', (data) => {
                console.log('CalendarSection Socket: 🆕 evento creado', data);
                fetchRef.current?.();
            });

            socket.on('event_updated', (data) => {
                console.log('CalendarSection Socket: ✏️ evento actualizado', data);
                fetchRef.current?.();
            });

            socket.on('event_deleted', (data) => {
                console.log('CalendarSection Socket: 🗑️ evento eliminado', data);
                fetchRef.current?.();
            });

            socket.on('disconnect', () => {
                console.log('CalendarSection Socket: desconectado ❌');
            });

            socket.on('connect_error', (err) => {
                console.log('CalendarSection Socket: error ❌', err.message);
            });

            // Cleanup: se ejecuta cuando la pantalla pierde foco
            return () => {
                console.log('CalendarSection Socket: cerrando conexión');
                socket.disconnect();
            };
        }, [])
    );

    const eventsByDate: Record<string, Event[]> = {};
    events.forEach((ev) => {
        const key = ev.fecha.slice(0, 10);
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push(ev);
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const todayStr = new Date().toISOString().slice(0, 10);

    const getDayKey = (day: number) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <View style={styles.wrapper}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Eventos este mes</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.monthNav}>
                    <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                        <Ionicons name="chevron-back" size={18} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>
                        {MONTHS_ES[month]} {year}
                    </Text>
                    <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                        <Ionicons name="chevron-forward" size={18} color="#374151" />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekRow}>
                    {DAYS_ES.map((d, i) => (
                        <Text key={i} style={[styles.weekDay, i === 0 && styles.sunday]}>{d}</Text>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator color="#6366f1" style={{ marginVertical: 24 }} />
                ) : (
                    <View style={styles.grid}>
                        {cells.map((day, idx) => {
                            if (!day) return <View key={idx} style={styles.cell} />;
                            const key = getDayKey(day);
                            const dayEvents = eventsByDate[key] || [];
                            const isToday = key === todayStr;
                            const isSelected = key === selectedDay;
                            const isSunday = idx % 7 === 0;
                            const isPast = key < todayStr;

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.cell,
                                        dayEvents.length > 0 && styles.cellHasEvents,
                                        isToday && styles.cellToday,
                                        isSelected && styles.cellSelected,
                                        isPast && styles.cellPast,
                                    ]}
                                    onPress={() => !isPast && setSelectedDay(isSelected ? null : key)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isSunday && styles.sundayText,
                                        dayEvents.length > 0 && styles.hasEventsText,
                                        isToday && styles.todayText,
                                        isSelected && styles.selectedText,
                                        isPast && styles.pastText,
                                    ]}>
                                        {day}
                                    </Text>

                                    {dayEvents.length > 0 && (
                                        <View style={styles.dotsRow}>
                                            {dayEvents.slice(0, 3).map((_, i) => (
                                                <View
                                                    key={i}
                                                    style={[styles.dot, { backgroundColor: isSelected ? '#90caf9' : '#fff' }]}
                                                />
                                            ))}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={styles.legendRow}>
                    <View style={styles.legendDot} />
                    <Text style={styles.legendText}>
                        {Object.keys(eventsByDate).filter(k =>
                            k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
                        ).length} días con eventos este mes
                    </Text>
                </View>
            </View>

            {selectedDay && (
                <View style={styles.eventsPanel}>
                    <Text style={styles.eventsPanelTitle}>
                        {selectedEvents.length > 0
                            ? `${selectedEvents.length} evento${selectedEvents.length > 1 ? 's' : ''} — ${selectedDay}`
                            : `Sin eventos — ${selectedDay}`}
                    </Text>

                    {selectedEvents.length === 0 && (
                        <View style={styles.emptyDay}>
                            <Ionicons name="calendar-outline" size={32} color="#d1d5db" />
                            <Text style={styles.emptyDayText}>No hay eventos este día</Text>
                        </View>
                    )}

                    {selectedEvents.map((ev, i) => {
                        const pct = (ev.cuposDisponibles / ev.cupos) * 100;
                        const color = pct <= 20 ? '#ef4444' : pct <= 50 ? '#f97316' : '#22c55e';
                        return (
                            <TouchableOpacity
                                key={ev._id}
                                style={styles.eventRow}
                                onPress={() => onEventPress?.(ev)}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.eventAccent, { backgroundColor: EVENT_COLORS[i % EVENT_COLORS.length] }]} />
                                <View style={styles.eventRowContent}>
                                    <Text style={styles.eventRowTitle} numberOfLines={1}>{ev.titulo}</Text>
                                    <View style={styles.eventRowMeta}>
                                        <Ionicons name="time-outline" size={12} color="#9ca3af" />
                                        <Text style={styles.eventRowMetaText}>{ev.horaInicio} – {ev.horaFin}</Text>
                                        {ev.destino?.nombre && (
                                            <>
                                                <Text style={styles.metaSep}>·</Text>
                                                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                                                <Text style={styles.eventRowMetaText} numberOfLines={1}>
                                                    {ev.destino.nombre}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.eventRowCupos}>
                                    <View style={[styles.cuposDot, { backgroundColor: color }]} />
                                    <Text style={[styles.cuposText, { color }]}>{ev.cuposDisponibles}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            <TouchableOpacity style={styles.fullCalBtn} onPress={onVerTodos} activeOpacity={0.85}>
                <Ionicons name="calendar" size={15} color="#fff" />
                <Text style={styles.fullCalBtnText}>Ver calendario completo</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CalendarSection;
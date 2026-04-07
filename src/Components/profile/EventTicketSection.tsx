import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    FlatList,
    Modal,
    Dimensions,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

const API_URL = 'https://uteq-connect-server-production.up.railway.app';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_GAP = 12;

interface Evento {
    _id: string;
    titulo: string;
    descripcion?: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    image?: string;
    activo: boolean;
}

interface Ticket {
    _id: string;
    evento: Evento;
    token: string;
    qrCode?: string;
    estadoInvitacion: 'enviada' | 'aceptada' | 'rechazada' | 'caducada';
    estadoAsistencia: 'pendiente' | 'asistio' | 'no_asistio';
    fechaEnvio: string;
}

const ESTADO_CONFIG = {
    aceptada:  { label: 'Confirmado', bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
    enviada:   { label: 'Pendiente',  bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
    rechazada: { label: 'Rechazado',  bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    caducada:  { label: 'Caducado',   bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' },
};

const ASISTENCIA_LABEL = {
    pendiente:  '🎫 Sin escanear',
    asistio:    '✅ Asistió',
    no_asistio: '❌ No asistió',
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
        weekday: 'short', day: 'numeric', month: 'short',
    });

// ── QR Modal ────────────────────────────────────────────────
const QRModal = ({ ticket, onClose }: { ticket: Ticket | null; onClose: () => void }) => {
    if (!ticket || !ticket.evento) return null;
    const estado = ESTADO_CONFIG[ticket.estadoInvitacion];
    return (
        <Modal visible={!!ticket} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={s.modalBackdrop} onPress={onClose}>
                <Pressable style={s.modalCard} onPress={() => {}}>
                    <View style={s.modalHeader}>
                        <Text style={s.modalTitle} numberOfLines={2}>{ticket.evento.titulo}</Text>
                        <View style={[s.modalBadge, { backgroundColor: estado.bg }]}>
                            <View style={[s.dot, { backgroundColor: estado.dot }]} />
                            <Text style={[s.modalBadgeText, { color: estado.text }]}>{estado.label}</Text>
                        </View>
                    </View>

                    <View style={s.qrContainer}>
                        {ticket.qrCode ? (
                            <Image
                                source={{ uri: ticket.qrCode }}
                                style={s.qrImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={s.qrPlaceholder}>
                                <Text style={s.qrPlaceholderText}>Sin QR</Text>
                            </View>
                        )}
                    </View>

                    <Text style={s.modalDate}>
                        📅 {formatDate(ticket.evento.fecha)}  🕐 {ticket.evento.horaInicio} – {ticket.evento.horaFin}
                    </Text>
                    <Text style={s.modalAsistencia}>{ASISTENCIA_LABEL[ticket.estadoAsistencia]}</Text>

                    <View style={s.modalTokenBox}>
                        <Text style={s.modalTokenLabel}>TOKEN</Text>
                        <Text style={s.modalTokenValue}>{ticket.token.substring(0, 20)}...</Text>
                    </View>

                    <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                        <Text style={s.closeBtnText}>Cerrar</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

// ── Ticket Card ──────────────────────────────────────────────
const TicketCard = ({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) => {
    if (!ticket.evento) return null;
    const estado = ESTADO_CONFIG[ticket.estadoInvitacion];
    const ev = ticket.evento;
    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
            <View style={s.cardImg}>
                {ev.image ? (
                    <Image source={{ uri: ev.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, s.imgPlaceholder]}>
                        <Text style={{ fontSize: 36 }}>🎪</Text>
                    </View>
                )}
                <View style={s.imgOverlay} />
                <View style={[s.badgeOverlay, { backgroundColor: estado.bg }]}>
                    <View style={[s.dot, { backgroundColor: estado.dot }]} />
                    <Text style={[s.badgeText, { color: estado.text }]}>{estado.label}</Text>
                </View>
            </View>

            <View style={s.cardInfo}>
                <Text style={s.cardTitle} numberOfLines={1}>{ev.titulo}</Text>
                <Text style={s.cardDate}>📅 {formatDate(ev.fecha)}</Text>
                <Text style={s.cardDate}>🕐 {ev.horaInicio} – {ev.horaFin}</Text>

                <View style={s.divider}>
                    <View style={s.notch} />
                    <View style={s.dashedLine} />
                    <View style={[s.notch, { right: -8, left: undefined }]} />
                </View>

                <View style={s.cardFooter}>
                    <Text style={s.footerAsistencia}>{ASISTENCIA_LABEL[ticket.estadoAsistencia]}</Text>
                    <Text style={s.tapHint}>Ver QR →</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ── Empty ────────────────────────────────────────────────────
const Empty = () => (
    <View style={s.empty}>
        <Text style={{ fontSize: 44 }}>🎟️</Text>
        <Text style={s.emptyTitle}>Sin boletos</Text>
        <Text style={s.emptySub}>Regístrate a un evento para ver tus boletos aquí.</Text>
    </View>
);

// ── Main ─────────────────────────────────────────────────────
const EventTicketSection = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Ticket | null>(null);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) { setError('No has iniciado sesión'); return; }
            const res = await fetch(`${API_URL}/api/invitaciones/my-tickets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok || !data.success) { setError(data.error || 'Error'); return; }
            const validTickets = (data.data as Ticket[])
                    .filter((t) =>
                        t.evento != null &&
                        t.estadoInvitacion === 'aceptada'
                    );
            setTickets(validTickets);
        } catch { setError('No se pudo conectar'); }
        finally { setLoading(false); }
    }, []);

    // Carga inicial
    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    // ── Socket.io ────────────────────────────────────────────
    useEffect(() => {
        console.log('EventTicketSection Socket: conectando...');
        const socket: Socket = io(API_URL, { transports: ['websocket'] });

        socket.on('connect', () => {
            console.log('EventTicketSection Socket: conectado ✅', socket.id);
        });

        // Ticket creado (auto-registro o invitación masiva desde dashboard)
        socket.on('ticket_created', (data) => {
            console.log('EventTicketSection Socket: 🎟️ ticket creado', data);
            fetchTickets();
        });

        // Ticket actualizado (respuesta aceptada/rechazada, asistencia manual, QR regenerado)
        socket.on('ticket_updated', (data) => {
            console.log('EventTicketSection Socket: ✏️ ticket actualizado', data);
            fetchTickets();
        });

        // QR escaneado desde dashboard → asistencia registrada
        socket.on('ticket_scanned', (data) => {
            console.log('EventTicketSection Socket: 📷 ticket escaneado', data);
            fetchTickets();
        });

        // Info del evento cambió (título, fecha, hora, etc.)
        socket.on('event_updated', (data) => {
            console.log('EventTicketSection Socket: 🔄 evento actualizado', data);
            fetchTickets();
        });

        // Evento eliminado → limpiar tickets huérfanos
        socket.on('event_deleted', (data) => {
            console.log('EventTicketSection Socket: 🗑️ evento eliminado', data);
            fetchTickets();
        });

        socket.on('disconnect', () => {
            console.log('EventTicketSection Socket: desconectado ❌');
        });

        socket.on('connect_error', (error) => {
            console.log('EventTicketSection Socket: error ❌', error.message);
        });

        return () => {
            console.log('EventTicketSection Socket: cerrando conexión');
            socket.disconnect();
        };
    }, [fetchTickets]);

    return (
        <View style={s.section}>
            <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Mis Boletos</Text>
                {!loading && !error && (
                    <Text style={s.sectionCount}>{tickets.length}</Text>
                )}
            </View>

            {loading ? (
                <View style={s.stateBox}>
                    <ActivityIndicator color="#1D356B" />
                    <Text style={s.stateText}>Cargando...</Text>
                </View>
            ) : error ? (
                <View style={s.stateBox}>
                    <Text style={s.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity onPress={fetchTickets} style={s.retryBtn}>
                        <Text style={s.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : tickets.length === 0 ? (
                <Empty />
            ) : (
                <FlatList
                    data={tickets}
                    horizontal
                    keyExtractor={(t) => t._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.carousel}
                    snapToInterval={CARD_WIDTH + CARD_GAP}
                    decelerationRate="fast"
                    renderItem={({ item }) => (
                        <TicketCard ticket={item} onPress={() => setSelected(item)} />
                    )}
                />
            )}

            <QRModal ticket={selected} onClose={() => setSelected(null)} />
        </View>
    );
};

// ── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
    section: { paddingBottom: 8 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 },
    sectionCount: {
        backgroundColor: '#1D356B', color: '#fff', fontSize: 12, fontWeight: '700',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden',
    },
    carousel: { paddingLeft: 20, paddingRight: 10, gap: CARD_GAP },
    card: {
        width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10, shadowRadius: 10, elevation: 5,
    },
    cardImg: { height: 110, position: 'relative' },
    imgPlaceholder: { backgroundColor: '#dde4f0', justifyContent: 'center', alignItems: 'center' },
    imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
    badgeOverlay: {
        position: 'absolute', top: 10, right: 10, flexDirection: 'row',
        alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    cardInfo: { padding: 14 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
    cardDate: { fontSize: 12, color: '#64748b', marginBottom: 2 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, position: 'relative' },
    notch: { position: 'absolute', left: -8, width: 14, height: 14, borderRadius: 7, backgroundColor: '#F2F2F2' },
    dashedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', marginHorizontal: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerAsistencia: { fontSize: 12, color: '#475569', fontWeight: '500' },
    tapHint: { fontSize: 11, color: '#1D356B', fontWeight: '700' },
    stateBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    stateText: { fontSize: 13, color: '#94a3b8' },
    errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center' },
    retryBtn: { backgroundColor: '#1D356B', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    retryText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 32, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
    modalBackdrop: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    modalCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%',
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
    },
    modalHeader: { width: '100%', alignItems: 'center', marginBottom: 16, gap: 8 },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
    modalBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5,
    },
    modalBadgeText: { fontSize: 12, fontWeight: '600' },
    qrContainer: {
        width: 220, height: 220, borderRadius: 16, overflow: 'hidden',
        backgroundColor: '#f1f5f9', marginBottom: 16, justifyContent: 'center', alignItems: 'center',
    },
    qrImage: { width: 210, height: 210 },
    qrPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    qrPlaceholderText: { color: '#94a3b8', fontSize: 14 },
    modalDate: { fontSize: 13, color: '#475569', marginBottom: 6, textAlign: 'center' },
    modalAsistencia: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 14 },
    modalTokenBox: {
        backgroundColor: '#f1f5f9', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 8, width: '100%', marginBottom: 20,
    },
    modalTokenLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
    modalTokenValue: { fontSize: 12, color: '#1D356B', fontWeight: '600', fontFamily: 'monospace' },
    closeBtn: { backgroundColor: '#1D356B', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
    closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default EventTicketSection;
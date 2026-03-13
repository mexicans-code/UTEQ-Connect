// import React from 'react';
// import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { TipoFiltro } from '../../types';

// interface FilterChipsProps {
//     filtroActivo: TipoFiltro;
//     onFiltroChange: (filtro: TipoFiltro) => void;
// }

// const FilterChips: React.FC<FilterChipsProps> = ({ filtroActivo, onFiltroChange }) => {
//     const filtros = [
//         { id: 'todos', label: 'Todos', icon: 'apps' },
//         { id: 'aula', label: 'Aulas', icon: 'school' },
//         { id: 'verde', label: 'Áreas Verdes', icon: 'leaf' },
//         { id: 'persona', label: 'Oficinas', icon: 'person' },
//         { id: 'servicio', label: 'Servicios', icon: 'restaurant' },
//     ];

//     return (
//         <View style={styles.container}>
//             <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//             >
//                 {filtros.map((filtro) => (
//                     <TouchableOpacity
//                         key={filtro.id}
//                         style={[
//                             styles.chip,
//                             filtroActivo === filtro.id && styles.chipActivo
//                         ]}
//                         onPress={() => onFiltroChange(filtro.id as TipoFiltro)}
//                         activeOpacity={0.7}
//                     >
//                         <Ionicons
//                             name={filtro.icon as any}
//                             size={18}
//                             color={filtroActivo === filtro.id ? 'white' : '#5F6368'}
//                         />
//                         <Text style={[
//                             styles.chipText,
//                             filtroActivo === filtro.id && styles.chipTextActivo
//                         ]}>
//                             {filtro.label}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </ScrollView>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         position: 'absolute',
//         top: 70,
//         left: 0,
//         right: 0,
//         zIndex: 5,
//     },
//     scrollContent: {
//         paddingHorizontal: 16,
//         gap: 8,
//     },
//     chip: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         backgroundColor: 'white',
//         borderWidth: 1,
//         borderColor: '#E8EAED',
//         gap: 6,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     chipActivo: {
//         backgroundColor: '#4285F4',
//         borderColor: '#4285F4',
//     },
//     chipText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#5F6368',
//     },
//     chipTextActivo: {
//         color: 'white',
//     },
// });

// export default FilterChips;
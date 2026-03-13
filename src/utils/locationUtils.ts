// import { TipoFiltro } from '../types';

// export const determinarTipoDestino = (nombre: string): TipoFiltro => {
//     const nombreLower = nombre.toLowerCase();

//     if (
//         nombreLower.includes('aula') ||
//         nombreLower.includes('salón') ||
//         nombreLower.includes('salon') ||
//         nombreLower.includes('laboratorio') ||
//         nombreLower.includes('lab') ||
//         nombreLower.includes('edificio') ||
//         nombreLower.includes('centro de cómputo') ||
//         nombreLower.includes('biblioteca') ||
//         nombreLower.includes('audiovisual')
//     ) {
//         return 'aula';
//     }

//     if (
//         nombreLower.includes('área verde') ||
//         nombreLower.includes('area verde') ||
//         nombreLower.includes('jardín') ||
//         nombreLower.includes('jardin') ||
//         nombreLower.includes('patio') ||
//         nombreLower.includes('cancha') ||
//         nombreLower.includes('explanada') ||
//         nombreLower.includes('parque')
//     ) {
//         return 'verde';
//     }

//     if (
//         nombreLower.includes('director') ||
//         nombreLower.includes('coordinador') ||
//         nombreLower.includes('secretaria') ||
//         nombreLower.includes('oficina') ||
//         nombreLower.includes('despacho') ||
//         nombreLower.includes('rectoría') ||
//         nombreLower.includes('rectoria') ||
//         nombreLower.includes('administración') ||
//         nombreLower.includes('administracion')
//     ) {
//         return 'persona';
//     }

//     if (
//         nombreLower.includes('cafetería') ||
//         nombreLower.includes('cafeteria') ||
//         nombreLower.includes('baño') ||
//         nombreLower.includes('sanitario') ||
//         nombreLower.includes('estacionamiento') ||
//         nombreLower.includes('entrada') ||
//         nombreLower.includes('salida')
//     ) {
//         return 'servicio';
//     }

//     return 'aula';
// };
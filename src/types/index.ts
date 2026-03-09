// src/types/index.ts

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface IEspacioInLocation {
    _id: string;
    nombre: string;
    planta: 'alta' | 'baja' | 'única';
    cupos: number;
    ocupado: boolean;
    descripcion?: string;
}

export interface Location {
    _id: string;
    nombre: string;
    posicion: Coordinates;
    image?: string;
    rutaPregrabada?: {
        origen: string;
        puntos: Coordinates[];
    };
    // Espacios populados desde el backend (salones/aulas dentro del destino)
    espacios?: IEspacioInLocation[];
}

export interface RouteInfo {
    distancia: string;
    duracion: string;
    distanciaValor: number;
    duracionValor: number;
}
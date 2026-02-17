// src/types/index.ts
export interface Location {
    _id: string;
    nombre: string;
    posicion: {
        latitude: number;
        longitude: number;
    };
}

export interface RouteInfo {
    distancia: string;
    duracion: string;
    distanciaValor: number;
    duracionValor: number;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}
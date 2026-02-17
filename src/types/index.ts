export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Location {
    _id: string;
    nombre: string;
    posicion: Coordinates;
    personData?: PersonData;

    // Propiedades opcionales para lugares
    direccion?: string;
    telefono?: string;
    horario?: string;
    sitioWeb?: string;
    calificacion?: number;
    totalResenas?: number;
    descripcion?: string;
    tipo?: string;
    fotos?: string[];

    // Propiedades opcionales para personas
    isPerson?: boolean;
    numeroEmpleado?: string;
    nombreCompleto?: string;
    email?: string;
    cargo?: string;
    departamento?: string;
    cubiculo?: string;
    planta?: string;
}

export interface RouteInfo {
    distancia: string;
    duracion: string;
    distanciaValor: number;
    duracionValor: number;
}

export interface PersonData {
    numeroEmpleado: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
    cargo: string;
    departamento: string;
    cubiculo?: string;
    planta?: string;
    ubicacion?: {
        nombre: string;
        coordenadas: Coordinates;
    };
}
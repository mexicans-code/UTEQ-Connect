import { API_URL } from './config';

export interface Location {
    _id: string;
    nombre: string;
    posicion: {
        latitude: number;
        longitude: number;
    };
    image?: string;
}

export const getLocations = async (): Promise<Location[]> => {
    try {
        const response = await fetch(`${API_URL}/locations`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// Encuentra el destino que mejor coincide con el departamento de un empleado
export const findDestinoByDepartamento = (
    locations: Location[],
    departamento: string
): Location | null => {
    if (!departamento || !locations.length) return null;

    const dep = departamento.toLowerCase().trim();

    // 1. Coincidencia exacta
    const exact = locations.find(l => l.nombre.toLowerCase().trim() === dep);
    if (exact) return exact;

    // 2. El nombre del destino está contenido en el departamento
    const contained = locations.find(l =>
        dep.includes(l.nombre.toLowerCase().trim())
    );
    if (contained) return contained;

    // 3. El departamento está contenido en el nombre del destino
    const reverse = locations.find(l =>
        l.nombre.toLowerCase().trim().includes(dep)
    );
    if (reverse) return reverse;

    // 4. Coincidencia por palabras clave (ignora preposiciones cortas)
    const STOP = new Set(["de", "del", "la", "el", "los", "las", "y", "e", "en", "a"]);
    const depWords = dep.split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));

    let bestScore = 0;
    let bestMatch: Location | null = null;

    for (const loc of locations) {
        const locWords = loc.nombre.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
        const score = depWords.reduce((acc, dw) => {
            return acc + (locWords.some(lw => lw.includes(dw) || dw.includes(lw)) ? 1 : 0);
        }, 0);
        if (score > bestScore) { bestScore = score; bestMatch = loc; }
    }

    return bestScore >= 1 ? bestMatch : null;
};
import { IEvent, IPersonal } from "../api/search.types";
import { API_URL } from "./config";

// All controllers return: { success: boolean, data: T[] }
interface ApiResponse<T> {
    success: boolean;
    data: T[];
}

// ─── Events ───────────────────────────────────────────────────────────────────
// GET /events/active  → { success: true, data: IEvent[] }
export const getActiveEvents = async (): Promise<IEvent[]> => {
    try {
        const res = await fetch(`${API_URL}/events/active`);
        if (!res.ok) return [];
        const body: ApiResponse<IEvent> = await res.json();
        return Array.isArray(body.data) ? body.data : [];
    } catch {
        return [];
    }
};

// GET /events  → { success: true, data: IEvent[] }
export const getEvents = async (): Promise<IEvent[]> => {
    try {
        const res = await fetch(`${API_URL}/events`);
        if (!res.ok) return [];
        const body: ApiResponse<IEvent> = await res.json();
        return Array.isArray(body.data) ? body.data : [];
    } catch {
        return [];
    }
};

// ─── Personal ─────────────────────────────────────────────────────────────────
// GET /personal  → { success: true, count: number, data: IPersonal[] }
export const getAllPersonal = async (): Promise<IPersonal[]> => {
    try {
        const res = await fetch(`${API_URL}/personal`);
        if (!res.ok) return [];
        const body: ApiResponse<IPersonal> = await res.json();
        return Array.isArray(body.data) ? body.data : [];
    } catch {
        return [];
    }
};

// GET /personal/buscar?q=  → { success: true, count: number, data: IPersonal[] }
export const searchPersonalApi = async (query: string): Promise<IPersonal[]> => {
    try {
        const res = await fetch(`${API_URL}/personal/buscar?q=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        const body: ApiResponse<IPersonal> = await res.json();
        return Array.isArray(body.data) ? body.data : [];
    } catch {
        return [];
    }
};

// ─── Helper: build full name from IPersonal ───────────────────────────────────
export const getNombreCompleto = (p: IPersonal): string =>
    `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`.trim();
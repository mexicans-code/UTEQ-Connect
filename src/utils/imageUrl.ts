import { API_URL } from '../api/config';

const SERVER_BASE = API_URL.replace(/\/api\/?$/, '');

export const buildImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE}/${path.replace(/^\//, '')}`;
};
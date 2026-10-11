/**
 * Returns the production base URL for sharing.
 * When running inside a mobile app wrapper (Capacitor/Android) or local dev,
 * it always falls back to the production URL https://sync-room-xj1z.vercel.app
 */
export const getProductionBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (
            !origin ||
            origin.includes('localhost') ||
            origin.includes('capacitor://') ||
            origin.includes('127.0.0.1') ||
            origin.startsWith('file://')
        ) {
            return import.meta.env.VITE_APP_URL || 'https://sync-room-xj1z.vercel.app';
        }
        return origin;
    }
    return import.meta.env.VITE_APP_URL || 'https://sync-room-xj1z.vercel.app';
};

export const getRoomShareUrl = (roomCode) => {
    return `${getProductionBaseUrl()}/join/${roomCode}`;
};

export const shareRoom = async (roomCode, roomName = 'SyncRoom') => {
    const url = getRoomShareUrl(roomCode);
    const title = `Join ${roomName} on SyncRoom`;
    const text = `Join my room "${roomName}" on SyncRoom and listen to synchronized music together in real-time!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url
            });
            return { shared: true, copied: false };
        } catch (err) {
            if (err.name === 'AbortError') {
                return { shared: false, copied: false, cancelled: true };
            }
        }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(url);
            return { shared: false, copied: true };
        } catch (err) {
            console.error('Clipboard copy failed:', err);
        }
    }

    return { shared: false, copied: false };
};

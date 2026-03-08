import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? '/' : 'http://localhost:5000');

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Initialize socket if not already done
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                auth: {
                    token: token
                },
                transports: ['websocket']
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });
        }

        return () => {
            // We don't necessarily want to disconnect on every unmount if we want to share the connection,
            // but for this specific implementation, we'll keep it simple.
            // In a larger app, you'd manage this in a context or a store.
        };
    }, [token]);

    return socketRef.current;
}

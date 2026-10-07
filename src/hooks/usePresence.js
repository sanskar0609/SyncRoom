import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function usePresence(roomCode, user) {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!roomCode || !user) return;

        const channel = supabase.channel(`room:${roomCode}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users = [];

                // Convert presence state object into a flat array of users
                for (const id in state) {
                    // state[id] is an array of presence objects for a specific key (user.id)
                    // We just take the first one since we track 1 presence per user ID
                    if (state[id].length > 0) {
                        users.push(state[id][0]);
                    }
                }

                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                // Optional: you could make a toast/notification here for "user joined"
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                // Optional: you could make a toast/notification here for "user left"
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track our own presence once successfully subscribed
                    await channel.track({
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        joinedAt: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [roomCode, user]);

    return { onlineUsers };
}

import { supabase } from './supabase';
import { userService } from './userService';

export const roomService = {
    createRoom: async (roomName, isPrivate, password) => {
        const userId = userService.getCurrentUser();
        if (!userId) throw new Error('User not initialized');

        // Generate a unique 6-character room code (avoiding ambiguous chars like O/0, I/l)
        const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
        let roomCode = '';
        for (let i = 0; i < 6; i++) {
            roomCode += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        const { data: room, error: roomError } = await supabase
            .from('rooms')
            .insert({
                room_code: roomCode,
                name: roomName,
                host_user_id: userId,
                is_private: isPrivate,
                password_hash: password || null, // normally hash this
                allow_everyone_control: false
            })
            .select()
            .single();

        if (roomError) throw roomError;

        // Create room state
        const { error: stateError } = await supabase
            .from('room_state')
            .insert({
                room_id: room.id,
            });

        if (stateError) throw stateError;

        return room;
    },

    joinRoom: async (roomCode, userId, username) => {
        // Look up the room
        const { data: room, error: findError } = await supabase
            .from('rooms')
            .select('*')
            .eq('room_code', roomCode)
            .single();

        if (findError || !room) {
            throw new Error('Room not found');
        }

        // Insert or update room member
        const { error: joinError } = await supabase
            .from('room_members')
            .upsert({
                room_id: room.id,
                user_id: userId,
                role: room.host_user_id === userId ? 'HOST' : 'MEMBER',
                last_seen_at: new Date().toISOString()
            }, { onConflict: 'room_id,user_id' });

        if (joinError) throw joinError;

        return room;
    }
};

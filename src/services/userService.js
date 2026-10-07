import { supabase } from './supabase';

const GUEST_ID_KEY = 'syncroom_guest_id';

export const userService = {
    // Get existing guest ID or create a new one
    getOrCreateGuestId: () => {
        let guestId = localStorage.getItem(GUEST_ID_KEY);
        if (!guestId) {
            // Generate a simple unique ID and prefix with 'guest_'
            guestId = `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
            localStorage.setItem(GUEST_ID_KEY, guestId);
        }
        return guestId;
    },

    // Save/update user profile in the database
    saveUserProfile: async (username) => {
        const id = userService.getOrCreateGuestId();

        // Check if exists, if so update, else insert
        // Using upsert since id is primary key
        const { data, error } = await supabase
            .from('users')
            .upsert({
                id,
                username,
                avatar: username.charAt(0).toUpperCase() // simple text avatar for now
            }, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }

        return data;
    },

    getCurrentUser: () => {
        return localStorage.getItem(GUEST_ID_KEY);
    }
};

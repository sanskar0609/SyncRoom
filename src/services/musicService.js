import { supabase } from './supabase';
import { extractVideoId, fetchVideoDetails } from '../utils/youtube';

export const musicService = {
    addSongToQueue: async (roomId, url, userId) => {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        const details = await fetchVideoDetails(videoId);

        // Get current max position
        const { data: currentSongs } = await supabase
            .from('songs')
            .select('position')
            .eq('room_id', roomId)
            .order('position', { ascending: false })
            .limit(1);

        const nextPosition = currentSongs && currentSongs.length > 0
            ? currentSongs[0].position + 1
            : 1;

        const { data, error } = await supabase
            .from('songs')
            .insert({
                room_id: roomId,
                youtube_video_id: videoId,
                title: details.title,
                thumbnail: details.thumbnail,
                channel_name: details.channelName,
                added_by: userId,
                position: nextPosition
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getQueue: async (roomId) => {
        const { data, error } = await supabase
            .from('songs')
            .select('*, users(username)')
            .eq('room_id', roomId)
            .order('position', { ascending: true });

        if (error) throw error;
        return data;
    },

    removeSong: async (songId) => {
        const { error } = await supabase
            .from('songs')
            .delete()
            .eq('id', songId);
        if (error) throw error;
    }
};

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export function usePlaybackSync(roomId, player, isHost, allowEveryoneControl) {
    const [roomState, setRoomState] = useState(null);
    const syncChannelRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const isLocalUpdateRef = useRef(false);

    // Can the current user control?
    const canControl = isHost || allowEveryoneControl;

    useEffect(() => {
        if (!roomId) return;

        // Load initial room state
        const fetchState = async () => {
            const { data } = await supabase
                .from('room_state')
                .select('*')
                .eq('room_id', roomId)
                .single();

            if (data) setRoomState(data);
        };

        fetchState();

        // Subscribe to realtime broadcasts AND database changes
        const channel = supabase.channel(`sync_${roomId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'room_state', filter: `room_id=eq.${roomId}` }, (payload) => {
                // If it's a remote update, handle it
                if (!isLocalUpdateRef.current) {
                    handleIncomingState(payload.new);
                }
            })
            .on('broadcast', { event: 'PLAYBACK_CMD' }, (payload) => {
                if (!isLocalUpdateRef.current) {
                    handleIncomingCommand(payload.payload);
                }
            })
            .subscribe();

        syncChannelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    const handleIncomingState = (newState) => {
        setRoomState(newState);
        if (!player) return;

        // We rely on handleIncomingCommand for instant play/pause/seek. 
        // This act as a fallback sync for late-joiners.
        syncPlayerToState(newState, player);
    };

    const handleIncomingCommand = (cmd) => {
        if (!player) return;

        // Ignore commands if we just sent one
        if (Date.now() - lastUpdateRef.current < 1000) return;

        const { type, currentTime, updatedAt } = cmd;

        try {
            if (type === 'PLAY') {
                const elapsed = (Date.now() - new Date(updatedAt).getTime()) / 1000;
                const targetTime = currentTime + elapsed;
                if (Math.abs(player.getCurrentTime() - targetTime) > 1.5) {
                    player.seekTo(targetTime, true);
                }
                player.playVideo();
            } else if (type === 'PAUSE') {
                player.seekTo(currentTime, true);
                player.pauseVideo();
            } else if (type === 'SEEK') {
                player.seekTo(currentTime, true);
            }
        } catch (err) {
            console.warn("YouTube player not ready for commands yet", err);
        }
    };

    const syncPlayerToState = (state, currentPlayer) => {
        if (!state.current_video_id) return;

        try {
            // If it's playing
            if (state.is_playing) {
                const elapsed = (Date.now() - new Date(state.updated_at).getTime()) / 1000;
                const expectedTime = Number(state.current_time) + elapsed;

                if (Math.abs(currentPlayer.getCurrentTime() - expectedTime) > 1.5) {
                    currentPlayer.seekTo(expectedTime, true);
                }
                if (currentPlayer.getPlayerState() !== 1) { // 1 = playing
                    currentPlayer.playVideo();
                }
            } else {
                // paused
                if (Math.abs(currentPlayer.getCurrentTime() - state.current_time) > 1) {
                    currentPlayer.seekTo(state.current_time, true);
                }
                if (currentPlayer.getPlayerState() !== 2) { // 2 = paused
                    currentPlayer.pauseVideo();
                }
            }
        } catch (err) {
            console.warn("YouTube player not ready for sync yet", err);
        }
    };

    const [initialSyncDone, setInitialSyncDone] = useState(false);

    // Keep player in sync continuously for late joiners when player instance changes
    useEffect(() => {
        if (!player || !roomState) return;

        if (!initialSyncDone) {
            syncPlayerToState(roomState, player);
            setInitialSyncDone(true);
        } else if (!canControl) {
            // Non-controllers sync on any room state refresh (fallback)
            syncPlayerToState(roomState, player);
        }
    }, [player, roomState, initialSyncDone, canControl]);

    // Command broadcasters
    const broadcastCommand = async (type, currentTime, videoId) => {
        if (!canControl) return;

        isLocalUpdateRef.current = true;
        lastUpdateRef.current = Date.now();

        const timestamp = new Date().toISOString();

        // 1. Send fast ephemeral broadcast
        if (syncChannelRef.current) {
            syncChannelRef.current.send({
                type: 'broadcast',
                event: 'PLAYBACK_CMD',
                payload: { type, currentTime, videoId, updatedAt: timestamp }
            });
        }

        // 2. Persist to room_state
        const { error } = await supabase
            .from('room_state')
            .update({
                current_video_id: videoId,
                is_playing: type === 'PLAY',
                current_time: currentTime,
                updated_at: timestamp
            })
            .eq('room_id', roomId);

        setTimeout(() => {
            isLocalUpdateRef.current = false;
        }, 1000);
    };

    return {
        roomState,
        broadcastCommand,
        canControl
    };
}

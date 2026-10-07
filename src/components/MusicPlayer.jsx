import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { usePlaybackSync } from '../hooks/usePlaybackSync';

export default function MusicPlayer({ room, currentUser, currentVideoId, isHost, allowEveryoneControl, onSongEnd, onVideoIdSync }) {
    const [player, setPlayer] = useState(null);

    const { roomState, broadcastCommand, canControl } = usePlaybackSync(room?.id, player, isHost, allowEveryoneControl);

    useEffect(() => {
        if (roomState?.current_video_id && roomState.current_video_id !== currentVideoId) {
            if (onVideoIdSync) onVideoIdSync(roomState.current_video_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomState?.current_video_id]);

    // Determine which video ID to play - either from local queue selection or room state
    const activeVideoId = currentVideoId || roomState?.current_video_id;

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            controls: 1,
            disablekb: canControl ? 0 : 1, // Disable keyboard controls if not allowed
        },
    };

    const onReady = (event) => {
        setPlayer(event.target);
    };

    const onStateChange = (event) => {
        if (!canControl) return; // Ignore events if user cannot control

        const playerState = event.data;
        const currentTime = event.target.getCurrentTime();

        // playerState: 1 = Playing, 2 = Paused, 3 = Buffering, 0 = Ended
        if (playerState === 1) { // Playing
            broadcastCommand('PLAY', currentTime, activeVideoId);
        } else if (playerState === 2) { // Paused
            broadcastCommand('PAUSE', currentTime, activeVideoId);
        } else if (playerState === 0) { // Ended
            if (onSongEnd) onSongEnd();
        }
    };

    // Sync seek events if they scrub the progress bar
    // YouTube API doesn't have an explicit 'onSeek' event, but it triggers buffering -> playing
    // which will naturally trigger a PLAY broadcast with the new currentTime.

    return (
        <div className="flex flex-col h-full w-full relative">
            {!canControl && activeVideoId && (
                <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-black/80 to-transparent flex justify-center pointer-events-none">
                    <span className="bg-primary/80 backdrop-blur px-3 py-1 text-xs font-bold rounded-full">
                        Host is controlling playback
                    </span>
                </div>
            )}

            {/* If it's playing but they don't have control, add an invisible overlay to block out all clicks to prevent them from manually scrubbing the iframe state natively. */}
            {!canControl && activeVideoId && (
                <div className="absolute inset-0 z-[60] bg-transparent cursor-not-allowed" title="The host is controlling playback" />
            )}

            <div className="flex-1 w-full relative bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl z-0">
                {activeVideoId ? (
                    <YouTube
                        videoId={activeVideoId}
                        opts={opts}
                        onReady={onReady}
                        onStateChange={onStateChange}
                        className={`absolute inset-0 w-full h-full ${!canControl ? 'pointer-events-none' : 'pointer-events-auto'}`}
                        iframeClassName="w-full h-full"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-panel to-black">
                        <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center mb-4 bg-white/5 shadow-inner">
                            <span className="text-4xl">🎵</span>
                        </div>
                        <p className="font-medium text-white/40">No video selected</p>
                        <p className="text-sm mt-2 opacity-50">Add a song to the queue to start listening.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

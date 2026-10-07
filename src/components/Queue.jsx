import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { musicService } from '../services/musicService';
import { Plus, Trash2, Music } from 'lucide-react';

export default function Queue({ room, currentUser, currentVideoId, onPlayVideo }) {
    const [songs, setSongs] = useState([]);
    const [url, setUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!room) return;

        const fetchSongs = async () => {
            try {
                const queue = await musicService.getQueue(room.id);
                setSongs(queue);
            } catch (err) {
                console.error("Failed to load queue", err);
            }
        };

        fetchSongs();

        const channel = supabase.channel(`queue_${room.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'songs', filter: `room_id=eq.${room.id}` }, () => {
                // Just reload the queue completely on any change for simplicity
                fetchSongs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room]);

    const handleAddSong = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsAdding(true);
        try {
            await musicService.addSongToQueue(room.id, url, currentUser.id);
            setUrl('');
        } catch (err) {
            alert("Error adding song: " + err.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (songId) => {
        try {
            await musicService.removeSong(songId);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/5 shrink-0 flex justify-between items-center bg-panel/50">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    <Music className="w-4 h-4" /> Queue
                </h3>
                <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-md">{songs.length} Tracks</span>
            </div>

            <div className="p-4 border-b border-white/5 shrink-0">
                <form onSubmit={handleAddSong} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Paste YouTube Link..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="input-field py-2 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={isAdding || !url.trim()}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {songs.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-500 text-sm">
                        <Music className="w-8 h-8 mb-2 opacity-50 text-white/50" />
                        Queue is empty
                    </div>
                ) : (
                    songs.map((song) => {
                        const isPlaying = song.youtube_video_id === currentVideoId;
                        return (
                            <div
                                key={song.id}
                                className={`flex gap-3 p-2 rounded-xl group transition-colors ${isPlaying ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div
                                    className="w-16 h-12 bg-black/50 rounded-lg overflow-hidden shrink-0 relative cursor-pointer"
                                    onClick={() => onPlayVideo(song.youtube_video_id, song.id)}
                                >
                                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-primary' : 'text-white'}`}>{song.title}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">Added by {song.users?.username || 'Unknown'}</p>
                                </div>

                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleRemove(song.id)}
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-gray-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function PlayIcon(props) {
    return (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

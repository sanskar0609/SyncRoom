import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { userService } from '../services/userService';
import { usePresence } from '../hooks/usePresence';
import { Users, LogOut, Settings, Music, MessageCircle, ListMusic } from 'lucide-react';
import { supabase } from '../services/supabase';
import Chat from '../components/Chat';
import Queue from '../components/Queue';
import MusicPlayer from '../components/MusicPlayer';
import ReactionBar from '../components/ReactionBar';
import ReactionsOverlay from '../components/ReactionsOverlay';
import RoomSettings from '../components/RoomSettings';

export default function Room() {
    const { roomCode } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [mobileTab, setMobileTab] = useState('music'); // music, queue, chat, people


    const isHost = room?.host_user_id === currentUser?.id;

    // Load user from local storage and verify they have a profile
    useEffect(() => {
        const fetchUserAndRoom = async () => {
            try {
                const userId = userService.getCurrentUser();
                if (!userId) {
                    navigate(`/join/${roomCode}`);
                    return;
                }

                // Fetch user from DB
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError || !user) {
                    navigate(`/join/${roomCode}`);
                    return;
                }

                setCurrentUser(user);

                // Fetch room from DB
                const { data: roomData, error: roomError } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('room_code', roomCode)
                    .single();

                if (roomError || !roomData) throw new Error('Room not found');

                setRoom(roomData);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError("Could not load room. You might need to join again.");
                setIsLoading(false);
            }
        };

        fetchUserAndRoom();
    }, [roomCode, navigate]);

    // Hook for presence
    const { onlineUsers } = usePresence(room ? roomCode : null, currentUser);

    // Listen for host kicks or room closures
    useEffect(() => {
        if (!room || !currentUser) return;
        const channel = supabase.channel(`sync_${room.id}`);
        // Cannot chain .on here easily because usePlaybackSync might use exact same topic.
        // It's allowed though.
        channel.on('broadcast', { event: 'KICK_USER' }, (payload) => {
            if (payload.payload.userId === currentUser.id) {
                alert("You have been kicked from the room by the host.");
                navigate('/');
            }
        });
        channel.on('broadcast', { event: 'ROOM_CLOSED' }, () => {
            alert("The host has closed the room.");
            navigate('/');
        });
        channel.subscribe();

        return () => channel.unsubscribe();
    }, [room, currentUser, navigate]);

    const handleLeave = () => {
        if (window.confirm("Are you sure you want to leave this room?")) {
            navigate('/');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <p className="text-gray-400">Loading room...</p>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pt-20 px-6">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-sm text-center">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="mb-6">{error || "Room not found"}</p>
                    <button onClick={() => navigate(`/join/${roomCode}`)} className="btn-secondary w-full">
                        Try Joining Again
                    </button>
                </div>
            </div>
        );
    }

    const handlePlayVideoFromQueue = async (videoId) => {
        if (!isHost && !room?.allow_everyone_control) {
            alert("Only the host can change songs in this room.");
            return;
        }

        // Push song change globally
        await supabase
            .from('room_state')
            .update({
                current_video_id: videoId,
                is_playing: true,
                current_time: 0,
                updated_at: new Date().toISOString()
            })
            .eq('room_id', room.id);

        setCurrentVideoId(videoId); // Also set locally for instant UI update
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 py-6">
            {/* Room Header */}
            <div className="glass-panel p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{room.name}</h1>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">{room.room_code}</span>
                        {room.is_private ? 'Private Room' : 'Public Room'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-panel rounded-xl border border-white/5 hidden sm:flex">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-medium text-sm">{onlineUsers.length} online</span>
                    </div>
                    {isHost && (
                        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors shrink-0 outline-none border border-transparent" title="Room Settings">
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={handleLeave} className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-colors shrink-0 outline-none border border-transparent hover:border-red-500/50" title="Leave Room">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Room Layout */}
            <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0 pb-20 lg:pb-0 relative">

                {/* Left Column: Playlist/Queue */}
                <div className={`${mobileTab === 'queue' ? 'flex' : 'hidden'} lg:flex lg:col-span-3 glass-panel p-0 flex-col overflow-hidden relative h-full`}>
                    <Queue
                        room={room}
                        currentUser={currentUser}
                        currentVideoId={currentVideoId}
                        onPlayVideo={(vId) => handlePlayVideoFromQueue(vId)}
                    />
                </div>

                {/* Center Column: Music Player */}
                <div className={`${mobileTab === 'music' ? 'flex' : 'hidden'} lg:flex lg:col-span-6 glass-panel p-6 flex-col justify-center items-center overflow-hidden relative h-full`}>
                    <MusicPlayer
                        room={room}
                        currentUser={currentUser}
                        currentVideoId={currentVideoId}
                        isHost={isHost}
                        allowEveryoneControl={room?.allow_everyone_control}
                        onSongEnd={() => {
                            // Can advance to next song here later
                        }}
                        onVideoIdSync={(vId) => setCurrentVideoId(vId)}
                    />

                    {/* Reactions Floating Overlay */}
                    <ReactionsOverlay roomId={room?.id} />

                    {/* Reaction Bar (bottom center) */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
                        <ReactionBar roomId={room?.id} currentUser={currentUser} />
                    </div>
                </div>

                {/* Right Column: Chat & Participants */}
                <div className={`${mobileTab === 'chat' || mobileTab === 'people' ? 'flex' : 'hidden'} lg:flex lg:col-span-3 flex-col gap-6 overflow-hidden h-full`}>

                    {/* Participants List */}
                    <div className={`${mobileTab === 'people' || mobileTab === 'chat' ? (mobileTab === 'people' ? 'flex-1' : 'hidden lg:flex') : ''} lg:max-h-[30%] glass-panel flex flex-col shrink-0 overflow-hidden`}>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Participants ({onlineUsers.length})</h3>
                        </div>
                        <div className="p-2 overflow-y-auto flex-1">
                            {onlineUsers.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-sm font-bold text-primary shrink-0">
                                        {u.avatar || u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{u.username} {u.id === currentUser?.id ? "(You)" : ""}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Box */}
                    <div className={`${mobileTab === 'chat' ? 'flex-1' : 'hidden lg:flex lg:flex-1'} glass-panel overflow-hidden`}>
                        <Chat room={room} currentUser={currentUser} />
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-panel/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex justify-around items-center z-[100]">
                <button onClick={() => setMobileTab('music')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mobileTab === 'music' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                    <Music className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Player</span>
                </button>
                <button onClick={() => setMobileTab('queue')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mobileTab === 'queue' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                    <ListMusic className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Queue</span>
                </button>
                <button onClick={() => setMobileTab('chat')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${mobileTab === 'chat' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Chat</span>
                </button>
                <button onClick={() => setMobileTab('people')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mobileTab === 'people' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-bold">People</span>
                </button>
            </div>

            {showSettings && (
                <RoomSettings
                    room={room}
                    currentUser={currentUser}
                    onlineUsers={onlineUsers}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}

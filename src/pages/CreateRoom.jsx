import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Lock, Unlock } from 'lucide-react';
import { roomService } from '../services/roomService';
import { userService } from '../services/userService';

export default function CreateRoom() {
    const [roomName, setRoomName] = useState('');
    const [username, setUsername] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!roomName.trim() || !username.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Create guest profile first
            await userService.saveUserProfile(username);

            // Create the room returning a room code
            const room = await roomService.createRoom(roomName, isPrivate, password);

            // Navigate to wait room / join room preview page
            navigate(`/join/${room.room_code}?created=true&host=${encodeURIComponent(username)}`);
        } catch (err) {
            console.error(err);
            setError("Failed to create room. Make sure Supabase is configured properly.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-20">
            <div className="glass-panel p-8">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Music className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">Create a Room</h2>
                <p className="text-gray-400 text-center mb-8">Set up your space to start listening</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Late Night Vibes"
                            maxLength={40}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Sanskar"
                            maxLength={20}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setIsPrivate(!isPrivate)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {isPrivate ? "Private Room (Requires Password)" : "Public Room (Anyone with link can join)"}
                        </button>
                    </div>

                    {isPrivate && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="Room Password"
                                required={isPrivate}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary w-full mt-6"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "Create Room"}
                    </button>
                </form>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Copy, Check } from 'lucide-react';
import { roomService } from '../services/roomService';
import { userService } from '../services/userService';

export default function JoinRoom() {
    const { roomCode } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [code, setCode] = useState(roomCode || '');
    const [username, setUsername] = useState(searchParams.get('host') || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState(null);

    const isCreator = searchParams.get('created') === 'true';

    useEffect(() => {
        if (roomCode) setCode(roomCode.toUpperCase());
    }, [roomCode]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!code.trim() || !username.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const user = await userService.saveUserProfile(username);
            const room = await roomService.joinRoom(code, user.id, username);

            // Navigate to the actual room component
            navigate(`/room/${code}`);
        } catch (err) {
            console.error(err);
            setError(err.message === 'Room not found' ? err.message : "Failed to join room.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-md mx-auto px-6 py-20">
            <div className="glass-panel p-8">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Users className="w-6 h-6 text-primary" />
                </div>

                {isCreator ? (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-2 text-green-400">Room Created!</h2>
                        <p className="text-gray-400 text-center mb-6">Share this link with your friends</p>

                        <div className="bg-background/50 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 mb-8">
                            <span className="font-mono text-gray-300 truncate font-semibold">{`${window.location.host}/join/${code}`}</span>
                            <button
                                onClick={copyLink}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0 text-white"
                                title="Copy link"
                            >
                                {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>

                        <div className="text-center">
                            <button onClick={handleJoin} className="btn-primary w-full max-w-[200px]" disabled={isLoading}>
                                {isLoading ? "Entering..." : "Enter Room"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-2">Join Room</h2>
                        <p className="text-gray-400 text-center mb-8">Listen and chat with friends</p>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleJoin} className="space-y-5">
                            {!roomCode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Room Code</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        className="input-field font-mono"
                                        placeholder="e.g. 7XK92P"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter your name"
                                    maxLength={20}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? "Joining..." : "Join Room"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

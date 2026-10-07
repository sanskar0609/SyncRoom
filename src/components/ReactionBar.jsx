import { Smile } from 'lucide-react';
import { supabase } from '../services/supabase';

const EMOJIS = ['❤️', '🔥', '😂', '😍', '👏', '🎵', '😭'];

export default function ReactionBar({ roomId, currentUser }) {
    const sendReaction = (emoji) => {
        supabase.channel(`sync_${roomId}`).send({
            type: 'broadcast',
            event: 'REACTION',
            payload: {
                id: Math.random().toString(36).substring(2, 9),
                emoji,
                username: currentUser.username,
                color: stringToColor(currentUser.username)
            }
        });
    };

    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-panel/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-x-auto no-scrollbar">
            <div className="px-2 text-gray-400">
                <Smile className="w-5 h-5" />
            </div>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <div className="flex gap-2">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-xl transition-transform hover:scale-125 active:scale-95"
                        title={`Send ${emoji}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}

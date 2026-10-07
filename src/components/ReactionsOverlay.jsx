import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function ReactionsOverlay({ roomId }) {
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        const channel = supabase.channel(`sync_${roomId}`)
            .on('broadcast', { event: 'REACTION' }, (payload) => {
                const { id, emoji, username, color } = payload.payload;

                // Add new reaction with random starting X position
                const newReaction = {
                    id,
                    emoji,
                    username,
                    color,
                    left: Math.random() * 60 + 20, // 20% to 80% range
                };

                setReactions(prev => [...prev, newReaction]);

                // Remove reaction after animation completes (3s)
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.id !== id));
                }, 3000);
            })
            .subscribe();

        return () => {
            // Removing the channel here might detach usePlaybackSync's channel if they share the name.
            // Wait, supabase.removeChannel actually removes the whole channel. 
            // Since they share `sync_${roomId}`, we should just unsubscribe from this specific event or don't remove if it's the exact same object.
            // Actually, Supabase JS handles repeated subscriptions to the same topic by returning the same channel instance.
            // Calling channel.unsubscribe() is safer.
            channel.unsubscribe();
        };
    }, [roomId]);

    return (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden h-full w-full">
            {reactions.map((reaction) => (
                <div
                    key={reaction.id}
                    className="absolute bottom-0 animate-float-up flex flex-col items-center drop-shadow-2xl"
                    style={{ left: `${reaction.left}%` }}
                >
                    <div className="text-4xl mb-1">{reaction.emoji}</div>
                    <div
                        className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur whitespace-nowrap text-white"
                        style={{ color: reaction.color }}
                    >
                        {reaction.username}
                    </div>
                </div>
            ))}
        </div>
    );
}

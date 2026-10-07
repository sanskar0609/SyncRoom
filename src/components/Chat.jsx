import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Chat({ room, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);

    // Fetch initial messages and subscribe
    useEffect(() => {
        if (!room || !currentUser) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('room_id', room.id)
                .order('created_at', { ascending: true })
                .limit(100);

            if (!error && data) {
                setMessages(data);
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase.channel(`chat_${room.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${room.id}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room, currentUser]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const msgData = {
            room_id: room.id,
            user_id: currentUser.id,
            username: currentUser.username,
            message: newMessage.trim(),
        };

        setNewMessage('');

        // Optimistically add the message to UI? No need, realtime is fast.
        const { error } = await supabase.from('messages').insert(msgData);

        if (error) {
            console.error('Error sending message Error:', error);
            // Could show a toast here
        }

        setIsSending(false);
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        Say hello to the room!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.user_id === currentUser.id;
                        const showHeader = index === 0 || messages[index - 1].user_id !== msg.user_id ||
                            (new Date(msg.created_at) - new Date(messages[index - 1].created_at) > 60000);

                        return (
                            <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {showHeader && (
                                    <span className="text-xs text-gray-500 mb-1 ml-1 mr-1">
                                        {isMe ? 'You' : msg.username} • {formatTime(msg.created_at)}
                                    </span>
                                )}
                                <div
                                    className={`max-w-[85%] px-4 py-2 rounded-2xl ${isMe
                                            ? 'bg-primary text-white rounded-tr-sm'
                                            : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                                        }`}
                                >
                                    <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-3 border-t border-white/5 shrink-0 bg-background/50">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none max-h-32 min-h-[44px]"
                        rows="1"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mb-[1px]"
                    >
                        <Send className="w-5 h-5 ml-[-2px]" />
                    </button>
                </form>
            </div>
        </div>
    );
}

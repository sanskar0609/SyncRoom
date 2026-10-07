import { useState } from 'react';
import { Settings, X, Copy, Check, Users, Shield, Edit2, Crown, Ban, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function RoomSettings({ room, currentUser, onlineUsers, onClose }) {
    const [activeTab, setActiveTab] = useState('general');
    const [roomName, setRoomName] = useState(room.name);
    const [isPrivate, setIsPrivate] = useState(room.is_private);
    const [allowControl, setAllowControl] = useState(room.allow_everyone_control);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleUpdateSettings = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const updates = {
                name: roomName,
                is_private: isPrivate,
                allow_everyone_control: allowControl,
            };
            // Keep simple logic: if they typed a new password, hash/update it
            if (password.trim() !== '') {
                updates.password_hash = password;
            }

            const { error } = await supabase.from('rooms').update(updates).eq('id', room.id);
            if (error) alert("Failed to update settings");
            else alert("Settings saved successfully!");
        } catch (err) {
            console.error(err);
        }
        setIsSaving(false);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${room.room_code}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleKickUser = async (userId) => {
        if (!window.confirm("Are you sure you want to kick this user?")) return;
        // Fast way: broadcast a kick event
        supabase.channel(`sync_${room.id}`).send({
            type: 'broadcast',
            event: 'KICK_USER',
            payload: { userId }
        });
    };

    const transferHost = async (userId) => {
        if (!window.confirm("Are you sure you want to transfer host powers? You will become a normal participant.")) return;
        await supabase.from('rooms').update({ host_user_id: userId }).eq('id', room.id);
        onClose();
    };

    const closeRoom = async () => {
        if (!window.confirm("Are you sure you want to permanently close and delete this room? Everyone will be kicked out.")) return;
        await supabase.from('rooms').delete().eq('id', room.id);
        // Realtime changes will naturally kick people if we listen to deletions, or we can broadcast a close event
        supabase.channel(`sync_${room.id}`).send({
            type: 'broadcast',
            event: 'ROOM_CLOSED',
            payload: {}
        });
        window.location.href = '/';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">

                {/* Sidebar */}
                <div className="w-full md:w-48 bg-black/20 border-r border-white/5 p-4 flex md:flex-col gap-2 overflow-x-auto shrink-0">
                    <h2 className="text-xl font-bold mb-4 hidden md:flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</h2>

                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 text-left rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`px-4 py-2 text-left rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'participants' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        Participants
                    </button>
                    <button
                        onClick={() => setActiveTab('danger')}
                        className={`px-4 py-2 text-left rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-red-500 hover:bg-red-500/10 ${activeTab === 'danger' ? 'bg-red-500/20' : ''}`}
                    >
                        Danger Zone
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    {activeTab === 'general' && (
                        <div className="max-w-sm space-y-6 animate-in fade-in">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Edit2 className="w-4 h-4 text-primary" /> Room Configuration</h3>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Room Name</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={e => setRoomName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Share Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/join/${room.room_code}`}
                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-gray-400"
                                    />
                                    <button onClick={copyLink} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                        {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Permissions & Privacy</label>

                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input type="checkbox" checked={allowControl} onChange={e => setAllowControl(e.target.checked)} className="w-4 h-4 accent-primary" />
                                    <span className="text-sm">Allow anyone to control playback</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer mb-2">
                                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 accent-primary" />
                                    <span className="text-sm">Private Room (Requires Password)</span>
                                </label>

                                {isPrivate && (
                                    <input
                                        type="password"
                                        placeholder="New Password (leave blank to keep current)"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none mt-2"
                                    />
                                )}
                            </div>

                            <button onClick={handleUpdateSettings} disabled={isSaving} className="btn-primary w-full py-2 !rounded-lg text-sm mt-4">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'participants' && (
                        <div className="animate-in fade-in">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-primary" /> Manage Participants</h3>
                            <p className="text-xs text-gray-400 mb-6">Note: Users will immediately be kicked back to the home screen if removed.</p>

                            <div className="space-y-2">
                                {onlineUsers.map(u => {
                                    const isHostUser = u.id === room.host_user_id;
                                    return (
                                        <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary font-bold text-sm">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium block">{u.username} {u.id === currentUser.id && '(You)'}</span>
                                                    {isHostUser && <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1"><Crown className="w-3 h-3" /> Host</span>}
                                                </div>
                                            </div>

                                            {!isHostUser && (
                                                <div className="flex gap-2 shrink-0">
                                                    <button onClick={() => transferHost(u.id)} className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg transition-colors border border-yellow-500/20">
                                                        Make Host
                                                    </button>
                                                    <button onClick={() => handleKickUser(u.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-colors border border-red-500/20">
                                                        Kick
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="animate-in fade-in h-full flex flex-col justify-center max-w-sm">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Close Room</h3>
                                <p className="text-sm text-gray-400 mb-8">
                                    This action is irreversible. Closing the room will kick all participants permanently and delete all queue data.
                                </p>
                                <button onClick={closeRoom} className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors">
                                    Permanently Close Room
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

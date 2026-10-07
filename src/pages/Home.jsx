import { Link } from 'react-router-dom';
import { Play, Users, MessageCircle, Music4 } from 'lucide-react';

export default function Home() {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Real-time synchronized listening
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                    Listen Together, <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Wherever You Are.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                    Create a private room, invite your friends, chat in real time, and listen to music together with perfectly synchronized playback.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link to="/create" className="btn-primary flex items-center justify-center gap-2">
                        <Play className="w-5 h-5 fill-current" />
                        Create Room
                    </Link>
                    <Link to="/join" className="btn-secondary flex items-center justify-center gap-2">
                        <Users className="w-5 h-5" />
                        Join Room
                    </Link>
                </div>
            </section>

            {/* Mock Interface Preview */}
            <section className="max-w-5xl mx-auto px-6 pb-32">
                <div className="glass-panel p-2 rounded-3xl">
                    <div className="bg-background rounded-2xl overflow-hidden border border-white/5 pb-0">
                        <div className="h-12 bg-panel/50 border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="mx-auto bg-black/40 px-4 py-1 rounded-md text-xs text-gray-400 font-mono tracking-wider flex items-center gap-2">
                                syncroom.app/room/7XK92P
                            </div>
                        </div>

                        <div className="aspect-video bg-gradient-to-br from-panel to-background relative p-6 flex flex-col justify-end">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

                            {/* Fake UI Overlay */}
                            <div className="relative z-10 flex justify-between items-end">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                        <Music4 className="w-8 h-8 text-primary shadow-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Late Night Vibes</h3>
                                        <p className="text-white/60 text-sm">4 people listening</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm">🔥 Rahul</div>
                                    <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm">❤️ Amit</div>
                                </div>
                            </div>

                            {/* Fake progress bar */}
                            <div className="relative z-10 w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
                                <div className="h-full bg-primary w-1/3 rounded-full relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 text-center relative group">
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg">01</div>
                        <h3 className="text-lg font-bold mb-2">Create a room</h3>
                        <p className="text-sm text-gray-400">Start a new room and become the host.</p>
                    </div>
                    <div className="glass-panel p-6 text-center relative group">
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg">02</div>
                        <h3 className="text-lg font-bold mb-2">Share the link</h3>
                        <p className="text-sm text-gray-400">Send the invite link to your friends.</p>
                    </div>
                    <div className="glass-panel p-6 text-center relative group">
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg">03</div>
                        <h3 className="text-lg font-bold mb-2">Friends join</h3>
                        <p className="text-sm text-gray-400">They join without needing an account.</p>
                    </div>
                    <div className="glass-panel p-6 text-center relative group">
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg">04</div>
                        <h3 className="text-lg font-bold mb-2">Listen & chat together</h3>
                        <p className="text-sm text-gray-400">Perfectly synced music and live messaging.</p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="glass-panel p-8 text-center sm:text-left transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0">
                            <Play className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Sync Playback</h3>
                        <p className="text-gray-400">When you hit play, everyone hears the music at the exact same time. No more "press play on 3" nonsense.</p>
                    </div>

                    <div className="glass-panel p-8 text-center sm:text-left transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0">
                            <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Live Chat</h3>
                        <p className="text-gray-400">Chat in real-time, react with emojis, and share your thoughts on the current track with your friends.</p>
                    </div>

                    <div className="glass-panel p-8 text-center sm:text-left transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Host Controls</h3>
                        <p className="text-gray-400">Control the queue, skip tracks, or let everyone add their favorite songs to the playlist.</p>
                    </div>
                </div>
            </section>

            {/* Privacy Section & CTA */}
            <section className="max-w-7xl mx-auto px-6 pb-12 flex flex-col items-center text-center">
                <div className="glass-panel p-10 md:p-16 rounded-3xl w-full bg-gradient-to-b from-panel to-background">
                    <h2 className="text-3xl font-bold mb-4">No account required. Privacy first.</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        Create temporary guest identities when joining a room. Your rooms can be secured with a password, keeping your listening parties totally private.
                    </p>
                    <Link to="/create" className="btn-primary inline-flex">
                        Get Started Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-500 border-t border-white/5">
                <p>© 2024 SyncRoom. Listen together. Chat together. Stay connected.</p>
            </footer>
        </div>
    );
}

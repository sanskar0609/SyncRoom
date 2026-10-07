import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none bg-panel/60">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <Headphones className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SyncRoom</span>
                </Link>
                <div className="flex gap-4">
                    <Link to="/join" className="text-gray-300 hover:text-white px-4 py-2 font-medium transition-colors hidden sm:block">
                        Join Room
                    </Link>
                    <Link to="/create" className="px-5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg font-medium transition-all">
                        Create Room
                    </Link>
                </div>
            </div>
        </nav>
    );
}

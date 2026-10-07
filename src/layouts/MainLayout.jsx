import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
            {/* Background ambient light */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <Navbar />

            <main className="flex-1 mt-20 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}

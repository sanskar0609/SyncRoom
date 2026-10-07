import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center pt-32 px-6">
            <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                The room or page you are looking for doesn't exist or has expired.
            </p>
            <Link to="/" className="btn-primary flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                <Home className="w-5 h-5" />
                Back to Home
            </Link>
        </div>
    );
}

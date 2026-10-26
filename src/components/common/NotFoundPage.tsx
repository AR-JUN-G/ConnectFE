import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from './Button';
import { ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-6">
        <Compass size={36} />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
        404
      </h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Page not found
      </h2>
      <p className="text-gray-500 max-w-sm mb-6 text-sm">
        The page you are looking for does not exist or may have been moved.
      </p>

      <Link to={ROUTES.HOME}>
        <Button variant="primary">Return to DevNetwork</Button>
      </Link>
    </div>
  );
}

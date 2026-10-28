import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';
import { ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <div className="mb-6">
        <Logo size="xl" showText={false} />
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
        <Button variant="primary">Return to Connect</Button>
      </Link>
    </div>
  );
}

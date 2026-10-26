import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Github } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../validation/authSchemas';
import { login, initiateGitHubOAuth } from '@/services/authService';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '@/api/apiError';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';

export function LoginPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.HOME;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      await refreshProfile();
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.validationErrors) {
          Object.entries(err.validationErrors).forEach(([field, msg]) => {
            setError(field as keyof LoginFormValues, { message: msg });
          });
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center items-start px-16 w-1/2 bg-primary-950 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Code2 size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">DevNetwork</span>
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Connect with developers<br />who build great things.
        </h1>
        <p className="text-primary-300 text-lg">
          Discover talent, send connection requests, and chat in real time.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Code2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">DevNetwork</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          {/* GitHub OAuth */}
          <Button
            type="button"
            variant="secondary"
            className="w-full mb-4"
            onClick={initiateGitHubOAuth}
            leftIcon={<Github size={18} />}
          >
            Continue with GitHub
          </Button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

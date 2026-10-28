import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '../validation/authSchemas';
import { register as registerUser } from '@/services/authService';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '@/api/apiError';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';

export function RegisterPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      await refreshProfile();
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.validationErrors) {
          Object.entries(err.validationErrors).forEach(([field, msg]) => {
            setError(field as keyof RegisterFormValues, { message: msg });
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
        <div className="mb-8">
          <Logo size="lg" textColor="text-white" />
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Start building<br />your dev network.
        </h1>
        <p className="text-primary-300 text-lg">
          Create a free account and connect with developers worldwide.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h2>
          <p className="text-gray-500 text-sm mb-8">Join the developer community</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="Ada"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Lovelace"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

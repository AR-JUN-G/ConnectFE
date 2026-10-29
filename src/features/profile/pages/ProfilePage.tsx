import { useState } from 'react';
import { Mail, Edit3, ShieldCheck, LogOut } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { EditProfileModal } from '../components/EditProfileModal';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ROUTES } from '@/constants/routes';

export function ProfilePage() {
  const { profile, isLoading, isError, error, refetch } = useProfile();
  const { logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return <Loader label="Loading profile..." className="py-20" />;
  }

  if (isError || !profile) {
    const errorMsg =
      error instanceof Error ? error.message : 'Failed to load profile details.';
    return <ErrorMessage message={errorMsg} onRetry={() => void refetch()} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner strip */}
        <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4 mb-6">
            <div className="ring-4 ring-white rounded-full inline-block bg-white shadow-md">
              <Avatar
                src={profile.profileImageUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                size="xl"
                className="w-24 h-24 text-3xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 size={16} />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                leftIcon={<LogOut size={16} />}
                onClick={async () => {
                  await logout();
                  window.location.href = ROUTES.LOGIN;
                }}
              >
                Sign out
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span>{profile.email}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Authenticated account via secure session</span>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialProfile={profile}
        />
      )}
    </div>
  );
}

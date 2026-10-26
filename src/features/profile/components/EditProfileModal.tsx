import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Camera } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { profileUpdateSchema, type ProfileUpdateFormValues } from '../validation/profileSchema';
import { useProfile } from '../hooks/useProfile';
import type { UserProfile } from '@/types';
import { ApiError } from '@/api/apiError';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: UserProfile;
}

export function EditProfileModal({ isOpen, onClose, initialProfile }: EditProfileModalProps) {
  const { updateProfile, isUpdating } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: initialProfile.firstName,
      lastName: initialProfile.lastName,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: initialProfile.firstName,
        lastName: initialProfile.lastName,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setServerError(null);
    }
  }, [isOpen, initialProfile, reset]);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setServerError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setServerError('Image size must be less than 5MB');
      return;
    }

    setServerError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    setServerError(null);
    try {
      const formData = new FormData();

      if (data.firstName && data.firstName.trim() !== initialProfile.firstName) {
        formData.append('firstName', data.firstName.trim());
      }

      if (data.lastName && data.lastName.trim() !== initialProfile.lastName) {
        formData.append('lastName', data.lastName.trim());
      }

      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      // Check if anything actually changed
      const hasChanges =
        formData.has('firstName') ||
        formData.has('lastName') ||
        formData.has('profileImage');

      if (!hasChanges) {
        onClose();
        return;
      }

      await updateProfile(formData);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.validationErrors) {
          Object.entries(err.validationErrors).forEach(([field, msg]) => {
            setError(field as keyof ProfileUpdateFormValues, { message: msg });
          });
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('Failed to save changes. Please try again.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-3 pb-2 border-b border-gray-100">
          <div className="relative group">
            <Avatar
              src={previewUrl ?? initialProfile.profileImageUrl}
              alt={`${initialProfile.firstName} ${initialProfile.lastName}`}
              size="xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Upload photo"
            >
              <Camera size={24} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearImage}
                aria-label="Clear selected photo"
              >
                <X size={14} />
              </Button>
            )}
          </div>
          {selectedFile && (
            <p className="text-xs text-gray-500">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Text Fields */}
        <div className="space-y-4">
          <Input
            label="First Name"
            placeholder="Ada"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Lovelace"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        {serverError && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {serverError}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isUpdating}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

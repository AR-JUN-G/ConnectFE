import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import { upsertConversation } from '../utils/conversationStorage';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const navigate = useNavigate();
  const [userIdInput, setUserIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userIdInput.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid developer User ID (positive number).');
      return;
    }

    const name = nameInput.trim() || `Developer #${id}`;
    upsertConversation({
      userId: id,
      name,
    });

    onClose();
    setUserIdInput('');
    setNameInput('');
    setError(null);

    navigate(ROUTES.chatWith(id), {
      state: { recipientName: name },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a Conversation" size="sm">
      <form onSubmit={handleStartChat} className="space-y-4">
        <p className="text-sm text-gray-500">
          Enter the User ID of a developer you are connected with to message them directly.
        </p>

        <Input
          label="Developer User ID *"
          type="number"
          placeholder="e.g. 2"
          value={userIdInput}
          onChange={(e) => {
            setUserIdInput(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
          required
        />

        <Input
          label="Developer Name (Optional)"
          type="text"
          placeholder="e.g. John Doe"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<MessageSquarePlus size={16} />}
            disabled={!userIdInput.trim()}
          >
            Open Chat
          </Button>
        </div>
      </form>
    </Modal>
  );
}

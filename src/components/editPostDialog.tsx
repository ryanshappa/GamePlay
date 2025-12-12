import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useToast } from '~/hooks/use-toast';

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialTitle: string;
  initialDescription: string;
  onPostUpdated: (post: { title: string; content: string }) => void;
}

export function EditPostDialog({
  open,
  onOpenChange,
  postId,
  initialTitle,
  initialDescription,
  onPostUpdated,
}: EditPostDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [titleError, setTitleError] = React.useState('');

  // Update local state when props change
  React.useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setTitleError('');
  }, [initialTitle, initialDescription, open]);

  const validateTitle = (value: string) => {
    if (!value || !value.trim()) {
      setTitleError('Title is required');
      return false;
    }
    if (value.trim().length > 100) {
      setTitleError('Title must be 100 characters or less');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    validateTitle(value);
  };

  const handleSaveChanges = async () => {
    if (!validateTitle(title)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/editPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          title: title.trim(),
          content: description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post.');
      }

      const data = await response.json();
      
      toast({
        title: 'Post Updated',
        description: 'Your post has been successfully updated.',
      });

      // Close the dialog first
      onOpenChange(false);
      
      onPostUpdated({
        title: data.post.title,
        content: data.post.content,
      });
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An error occurred while updating your post. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-background p-6 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-50 text-foreground border border-input">
          <Dialog.Title className="text-2xl font-bold mb-4">Edit Post</Dialog.Title>
          <Dialog.Close className="absolute top-3 right-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
            <Cross2Icon className="h-4 w-4" />
          </Dialog.Close>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter the title of your game"
                value={title}
                onChange={handleTitleChange}
                className={`w-full bg-muted text-foreground ${titleError ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {titleError && (
                <p className="text-sm text-red-500 mt-1">{titleError}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Description
              </label>
              <Textarea
                placeholder="Enter a description for your game (optional)"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="w-full h-32 bg-muted text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveChanges}
                disabled={isSubmitting || !!titleError || !title.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


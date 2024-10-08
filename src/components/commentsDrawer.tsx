import * as React from 'react';
import * as Drawer from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface Comment {
  id: number; 
  content: string;
  createdAt: string;
  user: {
    avatarUrl: string;
    username: string;
  };
}

interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  post: any;
}

export function CommentsDrawer({ open, onClose, post }: CommentsDrawerProps) {
  const { user } = useUser();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');

  React.useEffect(() => {
    if (open) {
      // Fetch comments for the post
      fetch(`/api/posts/${post.id}/comments`)
        .then((res) => res.json())
        .then((data) => setComments(data))
        .catch((err) => console.error(err));
    }
  }, [open, post.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => [...prev, comment]);
        setNewComment('');
      } else {
        console.error('Failed to add comment.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black opacity-50" />
        <Drawer.Content className="fixed right-0 top-0 h-full w-80 bg-gray-800 p-4 text-white overflow-y-auto">
          <Drawer.Title className="text-xl font-bold mb-4">Comments</Drawer.Title>
          <Drawer.Close className="absolute top-2 right-2 text-white hover:text-gray-400">
            &times;
          </Drawer.Close>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatarUrl || '/default-avatar.png'} alt="User Avatar" />
                  <AvatarFallback>{comment.user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{comment.user.username}</p>
                  <p>{comment.content}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Add Comment */}
          {user && (
            <div className="mt-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full mb-2 bg-gray-700 text-white"
              />
              <Button onClick={handleAddComment}>Post Comment</Button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

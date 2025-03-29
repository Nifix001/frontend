'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comment: string) => void;
  initialComment?: string; // Add this to pre-fill with existing comment
}

const CommentModal: React.FC<CommentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialComment = '' 
}) => {
  const [comment, setComment] = useState(initialComment);

  // Reset when opening modal with new initial comment
  useEffect(() => {
    if (isOpen) {
      setComment(initialComment);
    }
  }, [isOpen, initialComment]);

  const handleSave = () => {
    onSave(comment);
    setComment('');
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="comment-description">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription >
            Add a comment to this section of the document.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            id="comment-description"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comment here..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!comment.trim()}>
            Save Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
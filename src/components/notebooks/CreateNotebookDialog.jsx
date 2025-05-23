import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CreateNotebookDialog = ({ 
  isOpen, 
  setIsOpen, 
  newNotebook, 
  setNewNotebook, 
  handleCreateNotebook, 
  isCreating 
}) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!newNotebook.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleCreateNotebook();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription>
              Create a new notebook to start writing and organizing your thoughts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className={errors.title ? 'text-destructive' : ''}>
                Title {errors.title && <span className="text-xs">({errors.title})</span>}
              </Label>
              <Input
                id="title"
                value={newNotebook.title}
                onChange={(e) => setNewNotebook({ ...newNotebook, title: e.target.value })}
                className={errors.title ? 'border-destructive' : ''}
                placeholder="My New Notebook"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Initial Content (Optional)</Label>
              <Textarea
                id="content"
                value={newNotebook.content}
                onChange={(e) => setNewNotebook({ ...newNotebook, content: e.target.value })}
                placeholder="Start writing here..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={newNotebook.tags}
                onChange={(e) => setNewNotebook({ ...newNotebook, tags: e.target.value })}
                placeholder="Comma-separated tags (e.g. work, ideas, personal)"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Notebook'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotebookDialog;

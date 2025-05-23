import React from 'react';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NotebookActions = ({ 
  onBack, 
  onSave, 
  onDelete, 
  isSaving, 
  isDeleting 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 relative z-[51] md:mt-4 mt-20">
      <Button
        variant="secondary"
        className="gap-1 self-start"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Notebooks</span>
        <span className="sm:hidden">Back</span>
      </Button>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive"
            >
              <Trash className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your notebook.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default NotebookActions;

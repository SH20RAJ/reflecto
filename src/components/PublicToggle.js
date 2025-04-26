import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, Lock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function PublicToggle({ notebookId, initialIsPublic = false, onToggle }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/notebooks/${notebookId}/toggle-public`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update notebook visibility');
      }

      const data = await response.json();
      const newIsPublic = data.isPublic;

      setIsPublic(newIsPublic);

      toast({
        title: newIsPublic ? "Notebook is now public" : "Notebook is now private",
        description: newIsPublic
          ? "Anyone with the link can now view this notebook"
          : "Only you can view this notebook now",
        duration: 3000,
      });

      // Call the onToggle callback if provided
      if (onToggle) {
        onToggle(newIsPublic);
      }
    } catch (error) {
      console.error('Error toggling notebook visibility:', error);

      toast({
        title: "Error updating visibility",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublic ? (
        <Globe className="h-4 w-4 text-green-500" />
      ) : (
        <Lock className="h-4 w-4 text-gray-500" />
      )}

      <Switch
        id="public-toggle"
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />

      <Label htmlFor="public-toggle" className="cursor-pointer">
        {isPublic ? "Public" : "Private"}
      </Label>
    </div>
  );
}

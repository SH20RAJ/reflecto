import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function UsernameForm({ initialUsername = '', onUpdate = () => {} }) {
  const [username, setUsername] = useState(initialUsername);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      setStatus('error');
      setMessage('Please enter a username');
      return;
    }
    
    // Check if username is valid (alphanumeric, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setStatus('error');
      setMessage('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    
    setStatus('loading');
    
    try {
      const response = await fetch('/api/user/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        
        toast({
          title: "Username updated",
          description: data.message,
          duration: 3000,
        });
        
        // Call the onUpdate callback with the new username
        onUpdate(username);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
        
        toast({
          title: "Error",
          description: data.error || "Failed to update username",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Error updating username:', error);
      
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex space-x-2">
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={status === 'loading'}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={status === 'loading' || username === initialUsername}
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : 'Save'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Your username will be visible to others and used in your profile URL.
        </p>
      </div>
      
      {status === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            {message}
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {message}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}

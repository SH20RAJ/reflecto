"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import {
  User,
  Settings,
  Grid,
  Clock,
  Edit,
  LogOut,
  Book,
  Tag as TagIcon,
  Calendar,
  CheckCircle
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(true);
  const [stats, setStats] = useState({
    notebooksCount: 0,
    tagsCount: 0,
    lastUpdated: null
  });

  const isAuthenticated = status === "authenticated";

  // Set initial form values when session is loaded
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  // Fetch notebooks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotebooks();
    }
  }, [isAuthenticated]);

  const fetchNotebooks = async () => {
    try {
      setIsLoadingNotebooks(true);
      const response = await fetch('/api/notebooks');
      if (!response.ok) {
        throw new Error('Failed to fetch notebooks');
      }
      const data = await response.json();

      // Extract notebooks from the response
      const notebooksData = data.notebooks || [];

      // Calculate stats
      const uniqueTags = new Set();
      notebooksData.forEach(notebook => {
        notebook.tags?.forEach(tag => uniqueTags.add(tag.id));
      });

      // Find the most recent update
      let lastUpdated = null;
      if (notebooksData.length > 0) {
        lastUpdated = new Date(Math.max(...notebooksData.map(n => new Date(n.updatedAt))));
      }

      setStats({
        notebooksCount: notebooksData.length,
        tagsCount: uniqueTags.size,
        lastUpdated
      });

      // Set notebooks state
      setNotebooks(notebooksData);
      console.log('Fetched notebooks:', notebooksData);

      // Debug the data structure
      if (notebooksData.length > 0) {
        console.log('Sample notebook structure:', {
          id: notebooksData[0].id,
          title: notebooksData[0].title,
          contentPreview: notebooksData[0].content ? notebooksData[0].content.substring(0, 50) + '...' : 'No content',
          tags: notebooksData[0].tags,
          createdAt: notebooksData[0].createdAt,
          updatedAt: notebooksData[0].updatedAt
        });
      }
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      toast.error("Failed to load notebooks");
    } finally {
      setIsLoadingNotebooks(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would make an API call to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      toast.error("Error updating profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNotebook = (id) => {
    router.push(`/notebooks/${id}`);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="flex justify-center gap-4 mt-4">
            <Skeleton className="h-16 w-16" />
            <Skeleton className="h-16 w-16" />
            <Skeleton className="h-16 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-medium">Sign in to view profile</h3>
          <p className="text-muted-foreground">Please sign in to access your profile.</p>
          <Button onClick={() => router.push('/auth/signin')} className="mt-2">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="mb-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              {session.user.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {(session.user.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{session.user.name || "User"}</h1>
            <p className="text-muted-foreground">{session.user.email}</p>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.notebooksCount}</p>
                <p className="text-sm text-muted-foreground">Notebooks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.tagsCount}</p>
                <p className="text-sm text-muted-foreground">Tags</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {stats.lastUpdated ? format(new Date(stats.lastUpdated), 'MMM d') : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Last Update</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/notebooks')}
                className="gap-1"
              >
                <Book className="h-4 w-4" />
                My Notebooks
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Content Tabs */}
      <Tabs defaultValue="notebooks" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="notebooks" className="flex items-center gap-1">
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Notebooks</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Notebooks Tab */}
        <TabsContent value="notebooks">
          {isLoadingNotebooks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : !notebooks || notebooks.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No notebooks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first notebook to get started.
              </p>
              <Button onClick={() => router.push('/notebooks')}>
                Create Notebook
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(notebooks) && notebooks.map((notebook) => (
                <div
                  key={notebook.id}
                  className="aspect-square border rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                  onClick={() => handleViewNotebook(notebook.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium line-clamp-1">{notebook.title}</h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {notebook.content ? notebook.content.substring(0, 150) : 'No content'}
                    </p>
                  </div>

                  <div className="h-full w-full flex items-center justify-center bg-accent/50 p-4">
                    <div className="max-h-full overflow-hidden text-sm line-clamp-[12]">
                      {notebook.content ? notebook.content.substring(0, 300) : notebook.title}
                    </div>
                  </div>

                  {notebook.tags && notebook.tags.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {notebook.tags.length} {notebook.tags.length === 1 ? 'tag' : 'tags'}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent notebook activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNotebooks ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !notebooks || notebooks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(notebooks) && notebooks.slice(0, 5).map((notebook) => (
                    <div
                      key={notebook.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleViewNotebook(notebook.id)}
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notebook.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notebook.updatedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {notebook.content ? notebook.content.substring(0, 150) : 'No content'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {Array.isArray(notebooks) && notebooks.length > 5 && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/notebooks')}
                >
                  View All Notebooks
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={session.user.email || ""}
                      disabled
                      className="opacity-70"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your email cannot be changed.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your connected accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {session.user.image ? (
                          <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                        ) : (
                          <AvatarFallback>
                            {(session.user.name || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{session.user.name || "User"}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Actions that can&apos;t be undone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will sign you out from your current session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <AlertDialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Update your profile information.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                {session.user.image ? (
                  <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                ) : (
                  <AvatarFallback className="text-xl">
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={session.user.email || ""}
                disabled
                className="opacity-70"
              />
              <p className="text-xs text-muted-foreground">
                Your email cannot be changed.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

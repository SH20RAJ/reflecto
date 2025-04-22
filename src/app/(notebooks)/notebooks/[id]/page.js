"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RichEditor from "@/components/RichEditor";



export default function NotebookPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [notebook, setNotebook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorData, setEditorData] = useState(null);
  const [title, setTitle] = useState('');

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Fetch notebook data
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotebook();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, status]);

  // Fetch notebook from the API
  const fetchNotebook = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks/${id}`);

      if (response.ok) {
        const data = await response.json();
        setNotebook(data);
        setTitle(data.title);

        // Parse the content for the editor if it exists
        if (data.content) {
          try {
            const parsedContent = JSON.parse(data.content);
            setEditorData(parsedContent);
          } catch (e) {
            console.error('Error parsing notebook content:', e);
            // If not valid JSON, create a simple Editor.js structure
            setEditorData({
              time: new Date().getTime(),
              blocks: [
                {
                  type: "paragraph",
                  data: {
                    text: data.content
                  }
                }
              ]
            });
          }
        }
      } else if (response.status === 404) {
        router.push('/notebooks');
      } else {
        console.error('Failed to fetch notebook');
      }
    } catch (error) {
      console.error('Error fetching notebook:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/notebooks');
  };

  const handleEditorSave = (data) => {
    setEditorData(data);
    return Promise.resolve();
  };

  const handleSaveChanges = async () => {
    if (!notebook) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: JSON.stringify(editorData),
          tags: notebook.tags.map(tag => tag.name),
        }),
      });

      if (response.ok) {
        const updatedNotebook = await response.json();
        setNotebook(updatedNotebook);
        setIsEditing(false);
      } else {
        console.error('Failed to update notebook');
      }
    } catch (error) {
      console.error('Error updating notebook:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotebook = async () => {
    if (!notebook) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/notebooks');
      } else {
        console.error('Failed to delete notebook');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error deleting notebook:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={handleGoBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notebooks
            </Button>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Notebook Details</h1>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                notebook ? (
                  <div>
                    <div className="flex justify-center gap-4 mb-6">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        {isEditing ? 'Cancel Editing' : 'Edit Notebook'}
                      </Button>

                      {isEditing ? (
                        <Button
                          onClick={handleSaveChanges}
                          className="flex items-center gap-2"
                        >
                          Save Changes
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleDeleteNotebook}
                          className="flex items-center gap-2"
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </div>

                    <Card className="max-w-3xl mx-auto mb-8">
                      <CardHeader>
                        {isEditing ? (
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl font-semibold mb-2"
                            placeholder="Notebook Title"
                          />
                        ) : (
                          <CardTitle>{notebook.title}</CardTitle>
                        )}
                      </CardHeader>
                      <CardContent>
                        {editorData && (
                          <RichEditor
                            initialData={editorData}
                            onSave={handleEditorSave}
                            readOnly={!isEditing}
                            autofocus={isEditing}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg max-w-md mx-auto">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Loading notebook...</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg max-w-md mx-auto">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Please sign in to view this notebook.
                  </p>
                  <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

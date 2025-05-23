import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import PublicToggle from '@/components/PublicToggle';
import TagsManager from './TagsManager';
import { motion } from "framer-motion";

const NotebookHeader = ({
  notebook,
  title,
  setTitle,
  selectedTags,
  setSelectedTags,
  allTags
}) => {
  if (!notebook) return null;

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col space-y-4">
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl md:text-4xl font-bold mb-2 border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gradient-to-r from-primary/80 to-primary/40 bg-clip-text text-transparent dark:from-primary/60 dark:to-primary-foreground"
              placeholder="Untitled"
            />
          </div>
        </motion.div>

        {/* Mobile metadata - collapsible */}
        <div className="md:hidden">
          <details className="group">
            <summary className="flex items-center cursor-pointer list-none text-sm text-muted-foreground hover:text-primary transition-colors">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Details</span>
              </span>
              <motion.svg
                className="ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </motion.svg>
            </summary>
            <motion.div 
              className="mt-3 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Created {format(new Date(notebook.createdAt), 'MMM d, yyyy')}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Updated {format(new Date(notebook.updatedAt), 'MMM d, yyyy h:mm a')}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <PublicToggle
                  notebookId={notebook.id}
                  initialIsPublic={notebook.isPublic}
                  onToggle={(isPublic) => {
                    // Update the notebook in the parent component
                    notebook.isPublic = isPublic;
                  }}
                />
              </motion.div>
            </motion.div>
          </details>
        </div>

        {/* Desktop metadata - always visible */}
        <div className="hidden md:flex md:flex-wrap md:items-center text-sm text-muted-foreground gap-4">
          <motion.div 
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {format(new Date(notebook.createdAt), 'MMMM d, yyyy')}</span>
          </motion.div>

          <motion.div 
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {format(new Date(notebook.updatedAt), 'MMMM d, yyyy h:mm a')}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PublicToggle
              notebookId={notebook.id}
              initialIsPublic={notebook.isPublic}
              onToggle={(isPublic) => {
                // Update the notebook in the parent component
                notebook.isPublic = isPublic;
              }}
            />
          </motion.div>
        </div>

        {/* Tags manager - works on both mobile and desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <TagsManager
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotebookHeader;

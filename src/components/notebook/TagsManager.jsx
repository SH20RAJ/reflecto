import React, { useState } from 'react';
import { Tag as TagIcon, X, Plus, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { motion, AnimatePresence } from "framer-motion";

const TagsManager = ({ selectedTags, setSelectedTags, allTags }) => {
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        <TagIcon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
      </motion.div>
      <div className="flex flex-wrap gap-1.5 items-center">
        <AnimatePresence>
          {selectedTags.map(tag => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              layout
            >
              <Badge
                variant="outline"
                className="text-xs rounded-full px-2 py-0 h-5 flex items-center gap-1 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20"
              >
                {tag.name}
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
          <PopoverTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" className="h-5 px-2 text-xs rounded-full hover:bg-primary/10 hover:text-primary">
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="p-0 shadow-lg rounded-lg border-primary/20" side="right" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <motion.div 
                    className="p-2 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="mb-2">No tags found</div>
                    <div className="flex items-center gap-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Create new tag"
                        className="h-7 text-xs focus-visible:ring-primary/30 focus-visible:ring-offset-1"
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => {
                            if (newTag.trim()) {
                              const newTagObj = { id: `new-${Date.now()}`, name: newTag.trim() };
                              setSelectedTags([...selectedTags, newTagObj]);
                              setNewTag('');
                              setIsTagPopoverOpen(false);
                            }
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </CommandEmpty>
                <CommandGroup>
                  {allTags
                    .filter(tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id))
                    .map((tag, index) => (
                      <motion.div
                        key={tag.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CommandItem
                          onSelect={() => {
                            setSelectedTags([...selectedTags, tag]);
                            setIsTagPopoverOpen(false);
                          }}
                          className="hover:bg-primary/10 focus:bg-primary/20 rounded-md"
                        >
                          <TagIcon className="h-3 w-3 mr-2 text-primary/70" />
                          {tag.name}
                        </CommandItem>
                      </motion.div>
                    ))
                  }
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TagsManager;

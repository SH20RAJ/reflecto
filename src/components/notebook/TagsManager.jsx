import React, { useState } from 'react';
import { Tag as TagIcon, X, Plus, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const TagsManager = ({ selectedTags, setSelectedTags, allTags }) => {
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <TagIcon className="h-3.5 w-3.5 shrink-0" />
      <div className="flex flex-wrap gap-1.5 items-center">
        {selectedTags.map(tag => (
          <Badge
            key={tag.id}
            variant="outline"
            className="text-xs rounded-full px-2 py-0 h-5 flex items-center gap-1"
          >
            {tag.name}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-5 px-2 text-xs rounded-full">
              <Plus className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" side="right" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 text-sm">
                    <div className="mb-2">No tags found</div>
                    <div className="flex items-center gap-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Create new tag"
                        className="h-7 text-xs"
                      />
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
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {allTags
                    .filter(tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id))
                    .map(tag => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          setSelectedTags([...selectedTags, tag]);
                          setIsTagPopoverOpen(false);
                        }}
                      >
                        <TagIcon className="h-3 w-3 mr-2" />
                        {tag.name}
                      </CommandItem>
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

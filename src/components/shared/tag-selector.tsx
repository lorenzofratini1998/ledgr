'use client';

import * as React from "react";
import { X, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Tag } from "@/types/models";
import { createTagAction } from "@/features/tags/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function TagSelector({ tags, selectedIds, onChange, placeholder = "Select or create tags..." }: TagSelectorProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  // Local state for tags to immediately show newly created ones before server revalidation
  const [localTags, setLocalTags] = React.useState<Tag[]>(tags);

  React.useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  const handleUnselect = (tagId: string) => {
    onChange(selectedIds.filter((s) => s !== tagId));
  };

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selectedIds.length > 0) {
          const newSelected = [...selectedIds];
          newSelected.pop();
          onChange(newSelected);
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }, [selectedIds, onChange]);

  const selectables = localTags.filter(tag => !selectedIds.includes(tag.tag_id));
  const selected = localTags.filter(tag => selectedIds.includes(tag.tag_id));

  // Check if we need to show the "Create X" option
  const exactMatch = localTags.find(
    (t) => t.tag_name.toLowerCase() === inputValue.toLowerCase().trim()
  );
  
  const showCreateOption = inputValue.trim().length > 0 && !exactMatch && !isCreating;

  const handleCreate = async () => {
    if (!inputValue.trim() || isCreating) return;
    setIsCreating(true);
    const tagName = inputValue.trim();
    
    try {
      const response = await createTagAction({ tag_name: tagName });
      if (response.success && response.data) {
        const newTag = response.data;
        setLocalTags((prev) => [...prev, newTag]);
        onChange([...selectedIds, newTag.tag_id]);
        setInputValue("");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-lg focus-within:ring-3 focus-within:ring-ring/50 focus-within:border-ring"
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((tag) => {
            return (
              <Badge key={tag.tag_id} variant="secondary" className="data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground data-[state=pending]:animate-pulse">
                {tag.tag_name}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(tag.tag_id);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(tag.tag_id)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (inputValue.trim().length > 0 && !exactMatch) {
                  e.preventDefault();
                  handleCreate();
                }
              }
            }}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[120px]"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (selectables.length > 0 || showCreateOption) ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList>
              <CommandGroup className="h-full overflow-auto max-h-[200px]">
                {selectables.map((tag) => {
                  return (
                    <CommandItem
                      key={tag.tag_id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={(value) => {
                        setInputValue("");
                        onChange([...selectedIds, tag.tag_id]);
                      }}
                      className={"cursor-pointer"}
                    >
                      {tag.tag_name}
                    </CommandItem>
                  );
                })}
                
                {showCreateOption && (
                  <CommandItem
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={handleCreate}
                    className="cursor-pointer font-medium text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{inputValue}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  )
}

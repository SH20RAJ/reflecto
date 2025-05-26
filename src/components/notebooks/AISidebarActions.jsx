"use client";

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AISidebarActions({ 
  isOpen,
  selectedInsightType,
  insightTypes,
  onInsightTypeSelect,
  onGenerateInsights,
  isGenerating
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-4 p-4",
        !isOpen && "hidden"
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Select Analysis Type</h3>
        <div className="flex flex-wrap gap-2">
          {insightTypes.map((type) => (
            <Badge
              key={type.id}
              variant={selectedInsightType?.id === type.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onInsightTypeSelect(type)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <Button
        onClick={onGenerateInsights}
        disabled={!selectedInsightType || isGenerating}
        className="w-full"
      >
        {isGenerating ? "Generating..." : "Generate Insights"}
      </Button>
    </motion.div>
  );
}

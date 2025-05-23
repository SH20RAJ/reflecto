import React from 'react';
import { Button } from "@/components/ui/button";

const NotFoundState = ({ onBack }) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Notebook not found</p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={onBack}
      >
        Go back to notebooks
      </Button>
    </div>
  );
};

export default NotFoundState;

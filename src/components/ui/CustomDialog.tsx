import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const CustomDialog = ({ isOpen, onClose, children }: CustomDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg w-[90%] max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-foreground hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default CustomDialog;

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  details?: Array<{
    label: string;
    value: string | number;
  }>;
  children?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  icon: Icon,
  iconColor = "text-orange-600",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "destructive",
  details,
  children,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="relative bg-card border rounded-lg shadow-lg max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className={`p-2 bg-opacity-10 rounded-full ${iconColor.includes('orange') ? 'bg-orange-100' : iconColor.includes('red') ? 'bg-red-100' : 'bg-blue-100'}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          )}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-muted-foreground mb-4">
            {description}
          </p>
        )}
        
        {/* Details */}
        {details && details.length > 0 && (
          <div className="bg-muted rounded-lg p-4 mb-4 space-y-2 text-sm">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <span>{detail.label}:</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Custom Children */}
        {children}
        
        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

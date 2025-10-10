"use client";

import { useEffect, useCallback } from 'react';

interface UseExperimentProtectionProps {
  isExperimentActive: boolean;
  onBeforeUnload?: () => void;
}

export const useExperimentProtection = ({ 
  isExperimentActive, 
  onBeforeUnload 
}: UseExperimentProtectionProps) => {
  
  // Handle browser tab/window close, refresh, navigation
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isExperimentActive) {
      e.preventDefault();
      e.returnValue = 'You have an active experiment. Leaving will lose unsaved progress.';
      onBeforeUnload?.();
      return 'You have an active experiment. Leaving will lose unsaved progress.';
    }
  }, [isExperimentActive, onBeforeUnload]);

  // Handle keyboard shortcuts (Ctrl+R, F5, Ctrl+W, etc.)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isExperimentActive) {
      // Ctrl+R or F5 (refresh)
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        const shouldRefresh = window.confirm(
          'You have an active experiment. Refreshing will lose unsaved progress. Continue?'
        );
        if (shouldRefresh) {
          window.location.reload();
        }
      }
      
      // Ctrl+W (close tab)
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        // Note: Modern browsers don't allow preventing tab close, 
        // but we can show the beforeunload dialog
      }
    }
  }, [isExperimentActive]);

  useEffect(() => {
    if (isExperimentActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isExperimentActive, handleBeforeUnload, handleKeyDown]);
};

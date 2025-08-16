
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DragDropContextType {
  draggedItem: any;
  setDraggedItem: (item: any) => void;
  dropZone: string | null;
  setDropZone: (zone: string | null) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragDropContext.Provider value={{
      draggedItem,
      setDraggedItem,
      dropZone,
      setDropZone,
      isDragging,
      setIsDragging
    }}>
      {children}
    </DragDropContext.Provider>
  );
};

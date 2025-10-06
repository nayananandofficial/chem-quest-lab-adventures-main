import React from 'react';

export const EducationalTooltips: React.FC<{ reaction?: any }> = ({ reaction }) => {
  if (!reaction) return null;
  return (
    <div style={{ position: 'absolute', left: 16, bottom: 16, zIndex: 50 }}>
      <div className="p-2 bg-card border rounded shadow max-w-sm">
        <div className="font-semibold">{reaction.name}</div>
        <div className="text-xs text-muted-foreground">{reaction.balancedEquation}</div>
        <div className="mt-2 text-sm">{reaction.description}</div>
        <div className="mt-2 text-xs text-muted-foreground">{reaction.educationalNotes?.join(' • ')}</div>
      </div>
    </div>
  );
};

export default EducationalTooltips;

import React from 'react';

export const SafetyWarnings: React.FC<{ alerts: any[]; onClear?: () => void }> = ({ alerts, onClear }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div style={{ position: 'absolute', left: 16, top: 16, zIndex: 60 }}>
      <div className="p-2 bg-red-50 border border-red-200 rounded shadow max-w-md">
        <div className="font-semibold text-red-700">Safety Alerts</div>
        <ul className="text-sm">
          {alerts.map(a => (
            <li key={a.id} className="mt-1">{a.message} <span className="text-xs text-muted-foreground">({a.action})</span></li>
          ))}
        </ul>
        {onClear && (
          <button className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs" onClick={onClear}>Clear</button>
        )}
      </div>
    </div>
  );
};

export default SafetyWarnings;

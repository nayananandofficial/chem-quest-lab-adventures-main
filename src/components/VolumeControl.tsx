import React, { useState } from 'react';
import { Html } from '@react-three/drei';

interface Chemical {
  name: string;
  color: string;
  formula: string;
}

interface VolumeControlProps {
  currentVolume: number;
  maxVolume: number;
  onVolumeChange: (newVolume: number) => void;
  onChemicalAdd: (chemical: Chemical, volume: number) => void;
  position: [number, number, number];
  availableChemicals: Chemical[];
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  currentVolume,
  maxVolume,
  onVolumeChange,
  onChemicalAdd,
  position,
  availableChemicals
}) => {
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [showChemicals, setShowChemicals] = useState(false);

  const canAdd = currentVolume < maxVolume - 5;
  const canRemove = currentVolume >= 5;

  const addVolume = () => {
    if (canAdd) {
      onVolumeChange(currentVolume + 5);
    }
  };

  const removeVolume = () => {
    if (canRemove) {
      onVolumeChange(currentVolume - 5);
    }
  };

  const addChemical = (chemical: Chemical) => {
    if (canAdd) {
      onChemicalAdd(chemical, 5);
      setShowChemicals(false);
    }
  };

  return (
    <Html position={position} center>
      <div 
        style={{
          backgroundColor: 'rgba(0,0,0,0.95)',
          color: 'white',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {/* Volume Display */}
        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
            {currentVolume}ml / {maxVolume}ml
          </div>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#374151', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((currentVolume / maxVolume) * 100, 100)}%`,
              height: '100%',
              backgroundColor: currentVolume > maxVolume * 0.8 ? '#dc2626' : '#2563eb',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
        
        {/* Volume Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={removeVolume}
            disabled={!canRemove}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: canRemove ? '#dc2626' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: canRemove ? 'pointer' : 'not-allowed',
              fontSize: '12px'
            }}
          >
            -5ml
          </button>
          
          <button
            onClick={addVolume}
            disabled={!canAdd}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: canAdd ? '#2563eb' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: canAdd ? 'pointer' : 'not-allowed',
              fontSize: '12px'
            }}
          >
            +5ml
          </button>
        </div>

        {/* Chemical Selection */}
        <div>
          <button
            onClick={() => setShowChemicals(!showChemicals)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginBottom: '8px'
            }}
          >
            {showChemicals ? 'Hide Chemicals' : 'Add Chemical (+5ml)'}
          </button>

          {showChemicals && (
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #374151',
              borderRadius: '4px',
              backgroundColor: '#1f2937'
            }}>
              {availableChemicals.map((chemical, index) => (
                <div
                  key={index}
                  onClick={() => addChemical(chemical)}
                  style={{
                    padding: '8px',
                    borderBottom: index < availableChemicals.length - 1 ? '1px solid #374151' : 'none',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    opacity: canAdd ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: chemical.color,
                    border: '1px solid white'
                  }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{chemical.name}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{chemical.formula}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Html>
  );
};

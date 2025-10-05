import React from 'react';
import { useSmartChemistryEngine } from './SmartChemistryEngine';

export const useChemicalReactionEngine = () => {
  const engine = useSmartChemistryEngine();

  // Thin wrapper to provide semantic API
  const detect = (chemicalNames: string[], temperature = 20) => engine.detectReaction(chemicalNames, temperature);
  const perform = (chemicalNames: string[], temperature = 20, catalyst?: string) => engine.performReaction(chemicalNames, temperature, catalyst);

  return {
    ...engine,
    detect,
    perform,
  };
};

export default useChemicalReactionEngine;

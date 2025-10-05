import React, { useState } from 'react';

export const useExperimentScoring = () => {
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  const award = (points: number, reason?: string) => {
    setScore(prev => prev + points);
    if (reason) console.log(`Awarded ${points} points: ${reason}`);
  };

  const awardBadge = (badge: string) => {
    setBadges(prev => prev.includes(badge) ? prev : [...prev, badge]);
  };

  const reset = () => {
    setScore(0);
    setBadges([]);
  };

  return { score, badges, award, awardBadge, reset };
};

export const ExperimentScorePanel: React.FC<{ score: number; badges: string[] }> = ({ score, badges }) => {
  return (
    <div style={{ position: 'absolute', right: 400, top: 16, zIndex: 50 }}>
      <div className="p-2 bg-card border rounded shadow">
        <div className="text-sm font-semibold">Experiment Score</div>
        <div className="text-2xl font-bold">{score}</div>
        <div className="mt-2 text-xs">Badges: {badges.join(', ') || 'None'}</div>
      </div>
    </div>
  );
};

export default useExperimentScoring;

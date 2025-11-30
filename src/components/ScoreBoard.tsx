import React from 'react';

interface ScoreBoardProps {
    score: number;
    highScore: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore }) => {
    // Display score as distance (e.g., meters)
    const displayScore = Math.floor(score / 10);

    return (
        <div className="absolute top-4 right-4 flex flex-col items-end font-mono">
            <div className="text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                {displayScore.toString().padStart(5, '0')} m
            </div>
            <div className="text-sm text-gray-400">
                HI: {highScore.toString().padStart(5, '0')}
            </div>
        </div>
    );
};

export default ScoreBoard;

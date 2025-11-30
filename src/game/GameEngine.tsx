import React, { useEffect, useRef, useState } from 'react';
import Player from '../components/Player';
import ObstacleManager from './ObstacleManager';
import ScoreBoard from '../components/ScoreBoard';

export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const GAME_SPEED = 5;

const GameEngine: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('START');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Player State
    const [playerY, setPlayerY] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const [isJumping, setIsJumping] = useState(false);

    const requestRef = useRef<number>(0);
    const obstacleManager = useRef(new ObstacleManager());

    useEffect(() => {
        const storedHighScore = localStorage.getItem('neon-dash-highscore');
        if (storedHighScore) {
            setHighScore(parseInt(storedHighScore));
        }
    }, []);

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setPlayerY(0);
        setVelocity(0);
        obstacleManager.current.reset();
        loop();
    };

    const jump = () => {
        if (gameState !== 'PLAYING') return;
        if (!isJumping) {
            setVelocity(JUMP_FORCE);
            setIsJumping(true);
        }
    };

    const loop = () => {
        if (gameState !== 'PLAYING') return;

        // Physics
        setPlayerY((prevY) => {
            let newY = prevY + velocity;

            // Ground collision
            if (newY >= 0) {
                newY = 0;
                setIsJumping(false);
            } else {
                setVelocity((v) => v + GRAVITY);
            }
            return newY;
        });

        // Obstacles
        obstacleManager.current.update(GAME_SPEED);

        // Collision Detection
        // Player Hitbox (approximate)
        const playerRect = {
            x: 40, // Fixed left position (left-10 = 40px)
            y: window.innerHeight - 80 - 40 - playerY, // bottom-20 (80px) - height (40px) - Y offset
            width: 40,
            height: 40
        };

        // Check each obstacle
        for (const obs of obstacleManager.current.obstacles) {
            const obsRect = {
                x: obs.x,
                y: window.innerHeight - 80 - obs.height, // bottom-20
                width: obs.width,
                height: obs.height
            };

            if (
                playerRect.x < obsRect.x + obsRect.width &&
                playerRect.x + playerRect.width > obsRect.x &&
                playerRect.y < obsRect.y + obsRect.height &&
                playerRect.y + playerRect.height > obsRect.y
            ) {
                // Collision!
                setGameState('GAME_OVER');
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem('neon-dash-highscore', score.toString());
                }
                return; // Stop loop
            }
        }

        // Score
        setScore((s) => s + 1);

        requestRef.current = requestAnimationFrame(loop);
    };

    // Game Loop Effect
    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(loop);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState, velocity]); // Dependency on velocity is tricky for loop, better to use refs for physics vars if perf issues arise

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                if (gameState === 'START' || gameState === 'GAME_OVER') {
                    startGame();
                } else {
                    jump();
                }
            }
        };

        const handleTouch = () => {
            if (gameState === 'START' || gameState === 'GAME_OVER') {
                startGame();
            } else {
                jump();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouch);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [gameState, isJumping]);

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900 select-none">
            {/* Background Grid/Neon effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Game World */}
            <div className="absolute bottom-20 left-0 w-full h-[2px] bg-neon-blue shadow-[0_0_10px_#00f3ff]" />

            <Player y={playerY} />

            {/* Obstacles */}
            {obstacleManager.current.obstacles.map(obs => (
                <div
                    key={obs.id}
                    className={`absolute bottom-20 ${obs.type === 'box' ? 'bg-neon-green shadow-[0_0_10px_#00ff9f]' : 'bg-neon-purple shadow-[0_0_10px_#bc13fe]'} `}
                    style={{
                        left: obs.x,
                        width: obs.width,
                        height: obs.height,
                        // Simple triangle shape for spikes
                        clipPath: obs.type === 'spike' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                    }}
                />
            ))}

            {/* UI */}
            <ScoreBoard score={score} highScore={highScore} />

            {gameState === 'START' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-4">NEON DASH</h1>
                    <p className="text-xl text-white animate-pulse">Press SPACE or TAP to Start</p>
                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                    <h2 className="text-4xl text-red-500 font-bold mb-2">GAME OVER</h2>
                    <p className="text-2xl text-white mb-4">Score: {Math.floor(score / 10)}</p>
                    <button
                        onClick={startGame}
                        className="px-6 py-3 bg-neon-blue text-black font-bold rounded-full hover:bg-white transition-colors cursor-pointer"
                    >
                        TRY AGAIN
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameEngine;

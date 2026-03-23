import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine.js';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;

export default function GameCanvas({ player1, player2, onGameEnd }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [score, setScore] = useState({ 1: 0, 2: 0 });
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(
      canvas,
      player1,
      player2,
      (newScore) => setScore({ ...newScore }),
      (finalScore) => onGameEnd(finalScore, player1, player2)
    );

    engineRef.current = engine;
    engine.start();

    // Sync timer display
    const timerInterval = setInterval(() => {
      if (engineRef.current) {
        setTimeLeft(Math.ceil(engineRef.current.timeLeft));
      }
    }, 250);

    return () => {
      engine.stop();
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div style={styles.wrapper}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={styles.canvas}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#000',
  },
  canvas: {
    display: 'block',
    borderRadius: '8px',
    boxShadow: '0 0 40px rgba(255,199,44,0.3)',
    maxWidth: '100%',
  },
};

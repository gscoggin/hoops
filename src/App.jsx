import { useState } from 'react';
import PlayerSelect from './components/PlayerSelect.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import GameOver from './components/GameOver.jsx';

const SCREENS = {
  SELECT: 'select',
  GAME: 'game',
  OVER: 'over',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SELECT);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  const handleStart = (p1, p2) => {
    setPlayer1(p1);
    setPlayer2(p2);
    setScreen(SCREENS.GAME);
  };

  const handleGameEnd = (score) => {
    setFinalScore(score);
    setScreen(SCREENS.OVER);
  };

  const handleRematch = () => {
    setFinalScore(null);
    setScreen(SCREENS.GAME);
  };

  const handleMenu = () => {
    setPlayer1(null);
    setPlayer2(null);
    setFinalScore(null);
    setScreen(SCREENS.SELECT);
  };

  return (
    <>
      {screen === SCREENS.SELECT && (
        <PlayerSelect onStart={handleStart} />
      )}
      {screen === SCREENS.GAME && player1 && player2 && (
        <GameCanvas
          key={`${player1.id}-${player2.id}-${Date.now()}`}
          player1={player1}
          player2={player2}
          onGameEnd={handleGameEnd}
        />
      )}
      {screen === SCREENS.OVER && finalScore && (
        <GameOver
          score={finalScore}
          player1={player1}
          player2={player2}
          onRematch={handleRematch}
          onMenu={handleMenu}
        />
      )}
    </>
  );
}

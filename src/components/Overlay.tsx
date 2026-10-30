import React from 'react';
import { GameStatus, Confetti } from '../types';

interface OverlayProps {
  status: GameStatus;
  score: number;
  confetti: Confetti[];
  onStart: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ status, score, confetti, onStart }) => {
  if (status === 'playing') {
    return null;
  }

  return (
    <>
      {status === 'won' &&
        confetti.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}

      <div className="overlay">
        <div className="card">
          <div className="card-logo">CHARITY: WATER</div>

          {status === 'idle' ? (
            <>
              <h1>
                💧<br />
                <span>
                  WATER
                  <br />
                  CATCH
                </span>
              </h1>
              <p>
                Catch clean water droplets, avoid polluted droplets, and help bring clean
                water to communities around the world.
              </p>
              <button className="button" onClick={onStart} type="button">
                START GAME
              </button>
              <div className="subtext">Catch 10 clean droplets to reach 100 points!</div>
            </>
          ) : (
            <>
              <h1>
                {status === 'won' ? (
                  <>
                    🎉<br />
                    YOU DID IT!
                  </>
                ) : (
                  <>
                    🌊<br />
                    GAME OVER
                  </>
                )}
              </h1>
              <p>
                {status === 'won'
                  ? 'You caught 100 points worth of clean water droplets!'
                  : `Game over! You caught ${score} points.`}
              </p>
              <div style={{ fontSize: '25px', fontWeight: 900, margin: '18px 0' }}>
                ⭐ {score} POINTS
              </div>
              <button className="button" onClick={onStart} type="button">
                PLAY AGAIN
              </button>
              <div className="subtext">Every drop counts.</div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

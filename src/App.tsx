import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Drop, Confetti, GameStatus } from './types';
import { Header } from './components/Header';
import { GameScenery } from './components/GameScenery';
import { Basket } from './components/Basket';
import { DropItem } from './components/DropItem';
import { Overlay } from './components/Overlay';
import { InfoSection } from './components/InfoSection';
import { soundManager } from './utils/audio';

const CONFETTI_COLORS = ['#FFC907', '#003366', '#77A8BB', '#FFFFFF'];

export const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [basketPosition, setBasketPosition] = useState(50);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const gameRef = useRef<HTMLElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);

  const runningRef = useRef(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const timeRef = useRef(30);
  const basketPositionRef = useRef(50);
  const dropsRef = useRef<Drop[]>([]);
  const dropIdCounterRef = useRef(0);

  const timerIntervalRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    setMessageVisible(true);
    if (messageTimeoutRef.current !== null) {
      window.clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      setMessageVisible(false);
    }, 750);
  }, []);

  const launchConfetti = useCallback(() => {
    const pieces: Confetti[] = [];
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 1.2,
        duration: 2.2 + Math.random() * 1.5,
      });
    }
    setConfetti(pieces);
  }, []);

  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (spawnIntervalRef.current !== null) {
      window.clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    if (messageTimeoutRef.current !== null) {
      window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    if (animFrameIdRef.current !== null) {
      window.cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (won: boolean) => {
      if (!runningRef.current) return;
      runningRef.current = false;

      clearTimers();
      soundManager.stopBackgroundMusic();
      dropsRef.current = [];
      setDrops([]);

      if (won) {
        setGameStatus('won');
        launchConfetti();
        soundManager.playVictoryFanfare();
      } else {
        setGameStatus('gameover');
      }
    },
    [clearTimers, launchConfetti]
  );

  const createDrop = useCallback(() => {
    if (!runningRef.current) return;

    const isHazard = Math.random() < 0.25;
    const newDrop: Drop = {
      id: ++dropIdCounterRef.current,
      x: 5 + Math.random() * 90,
      y: -60,
      speed: 2.5 + Math.random() * 2.2,
      isHazard,
    };

    dropsRef.current.push(newDrop);
    setDrops([...dropsRef.current]);
  }, []);

  const startGame = useCallback(() => {
    clearTimers();
    dropsRef.current = [];
    setDrops([]);
    setConfetti([]);
    setMessageVisible(false);

    scoreRef.current = 0;
    livesRef.current = 3;
    timeRef.current = 30;
    basketPositionRef.current = 50;
    runningRef.current = true;

    setScore(0);
    setLives(3);
    setTime(30);
    setBasketPosition(50);
    setGameStatus('playing');

    // Start pleasant ambient background music
    soundManager.startBackgroundMusic();

    // 1-second countdown timer
    timerIntervalRef.current = window.setInterval(() => {
      if (!runningRef.current) return;
      timeRef.current -= 1;
      setTime(timeRef.current);
      if (timeRef.current <= 0) {
        endGame(false);
      }
    }, 1000);

    // Drop spawn timer (650ms)
    spawnIntervalRef.current = window.setInterval(createDrop, 650);
  }, [clearTimers, createDrop, endGame]);

  const moveBasketToClientX = useCallback((clientX: number) => {
    if (!runningRef.current || !gameRef.current || !basketRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const half = basketRef.current.offsetWidth / 2;
    const x = Math.max(half, Math.min(rect.width - half, clientX - rect.left));
    const newPos = (x / rect.width) * 100;
    basketPositionRef.current = newPos;
    setBasketPosition(newPos);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (runningRef.current) {
      moveBasketToClientX(event.clientX);
    }
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!runningRef.current || !gameRef.current) return;
      const gameWidth = gameRef.current.clientWidth;
      const step = (55 / gameWidth) * 100;

      let newPos = basketPositionRef.current;
      if (event.key === 'ArrowLeft') {
        newPos -= step;
      } else if (event.key === 'ArrowRight') {
        newPos += step;
      } else {
        return;
      }

      newPos = Math.max(5, Math.min(95, newPos));
      basketPositionRef.current = newPos;
      setBasketPosition(newPos);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Main game physics loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      if (runningRef.current && gameRef.current && basketRef.current) {
        const gameEl = gameRef.current;
        const basketEl = basketRef.current;
        const width = gameEl.clientWidth;
        const height = gameEl.clientHeight;
        const basketWidth = basketEl.offsetWidth;
        const basketLeft = (basketPositionRef.current / 100) * width - basketWidth / 2;
        const basketRight = basketLeft + basketWidth;
        const basketBottomOffset = parseFloat(window.getComputedStyle(basketEl).bottom) || 0;
        const basketTop = height - basketBottomOffset - basketEl.offsetHeight;
        const basketBottom = basketTop + basketEl.offsetHeight;

        const isMobile = width <= 520;
        const dropWidth = isMobile ? 38 : 52;
        const dropHeight = isMobile ? 38 : 52;

        const currentDrops = dropsRef.current;
        const survivingDrops: Drop[] = [];

        for (let i = 0; i < currentDrops.length; i++) {
          const drop = currentDrops[i];
          drop.y += drop.speed;

          const dropLeft = (drop.x / 100) * width;
          const dropRight = dropLeft + dropWidth;
          const dropTop = drop.y;
          const dropBottom = dropTop + dropHeight;

          const caught =
            dropLeft < basketRight &&
            dropRight > basketLeft &&
            dropTop < basketBottom &&
            dropBottom > basketTop;

          if (caught) {
            if (drop.isHazard) {
              livesRef.current -= 1;
              setLives(livesRef.current);
              soundManager.playHazardCatch();
              showMessage('☢ Hazard! Avoid polluted water!');

              if (livesRef.current <= 0) {
                endGame(false);
                return;
              }
            } else {
              scoreRef.current += 10;
              setScore(scoreRef.current);
              soundManager.playCleanCatch();
              showMessage('💧 Clean water collected!');

              if (scoreRef.current >= 100) {
                endGame(true);
                return;
              }
            }
            continue;
          }

          if (drop.y <= height + 70) {
            survivingDrops.push(drop);
          }
        }

        dropsRef.current = survivingDrops;
        setDrops([...survivingDrops]);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    animFrameIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [endGame, showMessage]);

  const handleToggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      if (!next && runningRef.current) {
        soundManager.startBackgroundMusic();
      }
      return next;
    });
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      soundManager.stopBackgroundMusic();
    };
  }, [clearTimers]);

  return (
    <div className="page">
      <Header
        score={score}
        time={time}
        lives={lives}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      <main
        className="game"
        id="game"
        ref={gameRef}
        onPointerMove={handlePointerMove}
      >
        <GameScenery />

        {/* Floating feedback message */}
        <div className={`message ${messageVisible ? 'show' : ''}`}>
          {message}
        </div>

        {/* Basket */}
        <Basket position={basketPosition} basketRef={basketRef} />

        {/* Falling droplets */}
        {drops.map((drop) => (
          <DropItem key={drop.id} drop={drop} />
        ))}

        {/* Instructions */}
        <div className="instructions">
          💧 Catch clean water for points! &nbsp; ☢ Avoid polluted drops!
        </div>

        {/* Overlays (Start / Won / Game Over) */}
        <Overlay
          status={gameStatus}
          score={score}
          confetti={confetti}
          onStart={startGame}
        />
      </main>

      <div className="reset-container">
        <button
          className="reset-button"
          id="resetButton"
          type="button"
          onClick={startGame}
        >
          RESET GAME
        </button>
      </div>

      <InfoSection />
    </div>
  );
};

export default App;

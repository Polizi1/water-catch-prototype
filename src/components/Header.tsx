import React from 'react';

interface HeaderProps {
  score: number;
  time: number;
  lives: number;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  time,
  lives,
  isMuted,
  onToggleSound,
}) => {
  return (
    <header className="header">
      <div className="topbar">
        <div className="brand">
          <span className="water-catch-wordmark">WATER CATCH</span>
          <span className="brand-divider">×</span>

          <div className="charity-logo">
            <img src="/images/jerrycan.png" alt="charity: water jerry can" />
            <span className="charity-name">charity: water</span>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">⭐ <span>{score}</span></div>
          </div>

          <div className="stat">
            <div className="stat-label">TIME</div>
            <div className="stat-value">◷ <span>{time}</span>s</div>
          </div>

          <div className="stat">
            <div className="stat-label">LIVES</div>
            <div className="stat-value">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={i < lives ? 'heart' : 'empty-heart'}
                  style={{ marginRight: i < 2 ? '4px' : '0' }}
                >
                  {i < lives ? '❤️' : '♡'}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="stat sound-toggle-btn"
            onClick={onToggleSound}
            title={isMuted ? 'Unmute music & sound' : 'Mute music & sound'}
            aria-label={isMuted ? 'Unmute music and sound' : 'Mute music and sound'}
          >
            <div className="stat-label">SOUND</div>
            <div className="stat-value">{isMuted ? '🔇' : '🔊'}</div>
          </button>
        </div>
      </div>

      <div className="progress-row">
        <div className="progress-title">PROGRESS TO 100 POINTS</div>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>

        <div className="progress-number">
          <span>{score}</span>/100
        </div>
      </div>
    </header>
  );
};

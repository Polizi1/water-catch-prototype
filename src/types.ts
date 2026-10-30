export interface Drop {
  id: number;
  x: number; // percentage (5 to 95)
  y: number; // pixels from top
  speed: number;
  isHazard: boolean;
}

export interface Confetti {
  id: number;
  left: number; // percentage
  color: string;
  delay: number; // seconds
  duration: number; // seconds
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'gameover';

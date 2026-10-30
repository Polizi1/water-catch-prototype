import React from 'react';
import { Drop } from '../types';

interface DropItemProps {
  drop: Drop;
}

export const DropItem: React.FC<DropItemProps> = ({ drop }) => {
  if (drop.isHazard) {
    return (
      <div
        className="hazard-drop"
        style={{
          left: `${drop.x}%`,
          top: `${drop.y}px`,
        }}
        data-hazard="true"
      >
        <span className="hazard-water">💧</span>
        <span className="hazard-symbol">☢</span>
      </div>
    );
  }

  return (
    <div
      className="water-drop"
      style={{
        left: `${drop.x}%`,
        top: `${drop.y}px`,
      }}
      data-hazard="false"
    >
      💧
    </div>
  );
};

import React from 'react';

interface BasketProps {
  position: number; // percentage (0 to 100)
  basketRef: React.RefObject<HTMLDivElement>;
}

export const Basket: React.FC<BasketProps> = ({ position, basketRef }) => {
  return (
    <div
      ref={basketRef}
      className="basket"
      style={{ left: `${position}%` }}
    >
      <div className="basket-handle" />
      <div className="basket-label">CATCH</div>
    </div>
  );
};

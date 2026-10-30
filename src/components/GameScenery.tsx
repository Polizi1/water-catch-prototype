import React from 'react';

export const GameScenery: React.FC = () => {
  return (
    <>
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="cloud cloud-three" />

      <div className="mountains">
        <div className="mountain mountain-one" />
        <div className="mountain mountain-two" />
        <div className="mountain mountain-three" />
        <div className="mountain mountain-four" />
        <div className="front-mountain front-one" />
        <div className="front-mountain front-two" />
        <div className="front-mountain front-three" />
      </div>

      <div className="land" />
      <div className="shore" />
      <div className="water" />
      <div className="ripple ripple-one" />
      <div className="ripple ripple-two" />
      <div className="ripple ripple-three" />
    </>
  );
};

import React from 'react';

export const InfoSection: React.FC = () => {
  return (
    <section className="info-section">
      <div className="info-card">
        <h3>💧 Clean Drops</h3>
        <p>
          Catch the blue water droplets to earn <b>10 points</b>.
        </p>
      </div>
      <div className="info-card">
        <h3>☢ Hazard Drops</h3>
        <p>
          Avoid the dark polluted droplets. Catching one costs you <b>1 life</b>.
        </p>
      </div>
      <div className="info-card">
        <h3>🌎 Goal</h3>
        <p>
          Reach <b>100 points</b> before the 30-second timer runs out.
        </p>
      </div>
    </section>
  );
};

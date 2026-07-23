import React, { useMemo } from 'react';

export const Snowfall = ({ enabled }) => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 30 }).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      size: Math.random() * 12 + 6,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-sky-300 animate-snowflake select-none"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
            top: '-20px',
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

import React from 'react';

export default function App() {
  return (
    <iframe
      src="/singlefile/index.html"
      title="Tundra Network Singlefile"
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: '#050914'
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad; microphone; focus-without-user-activation"
      allowFullScreen
    />
  );
}



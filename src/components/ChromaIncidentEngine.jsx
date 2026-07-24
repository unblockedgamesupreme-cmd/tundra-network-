import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Award, Zap, Shield, HelpCircle } from 'lucide-react';

export const ChromaIncidentEngine = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, gameover, win
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [colorMode, setColorMode] = useState('RED'); // RED, BLUE, GREEN
  const [prismsCollected, setPrismsCollected] = useState(0);
  const [totalPrisms, setTotalPrisms] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Synth via Web Audio API
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'jump') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'shift') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'prism') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'death') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const levelLayouts = [
    // Level 1: Intro
    {
      prisms: [
        { x: 210, y: 270, collected: false, color: 'RED' },
        { x: 400, y: 190, collected: false, color: 'BLUE' },
        { x: 590, y: 250, collected: false, color: 'GREEN' },
      ],
      platforms: [
        { x: 0, y: 440, w: 800, h: 40, type: 'WHITE' },
        { x: 140, y: 340, w: 140, h: 18, type: 'RED' },
        { x: 330, y: 260, w: 140, h: 18, type: 'BLUE' },
        { x: 520, y: 320, w: 140, h: 18, type: 'GREEN' },
      ],
      lasers: [
        { x: 300, y: 320, w: 12, h: 120, type: 'GREEN' },
      ],
      exit: { x: 720, y: 380, w: 40, h: 60 },
      spawn: { x: 50, y: 380 }
    },
    // Level 2: Advanced Chromatic Grid
    {
      prisms: [
        { x: 180, y: 260, collected: false, color: 'BLUE' },
        { x: 330, y: 180, collected: false, color: 'RED' },
        { x: 500, y: 110, collected: false, color: 'GREEN' },
        { x: 710, y: 280, collected: false, color: 'BLUE' },
      ],
      platforms: [
        { x: 0, y: 440, w: 180, h: 40, type: 'WHITE' },
        { x: 120, y: 330, w: 120, h: 18, type: 'BLUE' },
        { x: 270, y: 250, w: 120, h: 18, type: 'RED' },
        { x: 440, y: 180, w: 120, h: 18, type: 'GREEN' },
        { x: 630, y: 360, w: 170, h: 40, type: 'WHITE' },
      ],
      lasers: [
        { x: 240, y: 200, w: 10, h: 240, type: 'RED' },
        { x: 410, y: 100, w: 10, h: 340, type: 'BLUE' },
      ],
      exit: { x: 730, y: 300, w: 40, h: 60 },
      spawn: { x: 40, y: 380 }
    },
    // Level 3: Spectrum Core
    {
      prisms: [
        { x: 210, y: 270, collected: false, color: 'RED' },
        { x: 350, y: 170, collected: false, color: 'BLUE' },
        { x: 510, y: 230, collected: false, color: 'GREEN' },
      ],
      platforms: [
        { x: 0, y: 440, w: 140, h: 40, type: 'WHITE' },
        { x: 150, y: 340, w: 120, h: 18, type: 'RED' },
        { x: 290, y: 240, w: 120, h: 18, type: 'BLUE' },
        { x: 450, y: 300, w: 120, h: 18, type: 'GREEN' },
        { x: 640, y: 420, w: 160, h: 40, type: 'WHITE' },
      ],
      lasers: [
        { x: 260, y: 150, w: 12, h: 290, type: 'GREEN' },
        { x: 420, y: 150, w: 12, h: 290, type: 'RED' },
      ],
      exit: { x: 720, y: 360, w: 40, h: 60 },
      spawn: { x: 40, y: 380 }
    }
  ];

  const currentLevelData = levelLayouts[(level - 1) % levelLayouts.length];

  const colorModeRef = useRef(colorMode);
  colorModeRef.current = colorMode;

  const handleShiftColor = (newColor) => {
    colorModeRef.current = newColor;
    setColorMode(newColor);
    playSound('shift');
  };

  const handleStartGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    colorModeRef.current = 'RED';
    setColorMode('RED');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let keys = {};

    // Clone level state
    let curLevelObj = JSON.parse(JSON.stringify(currentLevelData));
    setTotalPrisms(curLevelObj.prisms.length);
    setPrismsCollected(0);

    // Player Object
    let player = {
      x: curLevelObj.spawn.x,
      y: curLevelObj.spawn.y,
      vx: 0,
      vy: 0,
      radius: 14,
      isGrounded: false,
      jumpsRemaining: 2,
    };

    let jumpPressed = false;
    let particles = [];

    const addParticles = (px, py, colorHex, count = 8) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1.0,
          color: colorHex
        });
      }
    };

    const handleKeyDown = (e) => {
      keys[e.code] = true;
      if (e.code === 'Digit1') handleShiftColor('RED');
      if (e.code === 'Digit2') handleShiftColor('BLUE');
      if (e.code === 'Digit3') handleShiftColor('GREEN');
      if (e.code === 'KeyC' || e.code === 'ShiftLeft') {
        const nextColor = colorModeRef.current === 'RED' ? 'BLUE' : colorModeRef.current === 'BLUE' ? 'GREEN' : 'RED';
        colorModeRef.current = nextColor;
        setColorMode(nextColor);
        playSound('shift');
      }

      // Single jump trigger on key press for responsive double jump
      if ((e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') && !jumpPressed) {
        jumpPressed = true;
        if (player.jumpsRemaining > 0) {
          player.vy = -450;
          player.jumpsRemaining -= 1;
          player.isGrounded = false;
          playSound('jump');
          addParticles(player.x, player.y + player.radius, '#38bdf8', 6);
        }
      }
    };

    const handleKeyUp = (e) => {
      keys[e.code] = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        jumpPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main Game Loop
    let lastTime = performance.now();
    const gameLoop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Controls
      if (keys['KeyA'] || keys['ArrowLeft']) {
        player.vx = -220;
      } else if (keys['KeyD'] || keys['ArrowRight']) {
        player.vx = 220;
      } else {
        player.vx *= 0.8;
      }

      // Physics Gravity
      player.vy += 850 * dt;

      // Move player X
      player.x += player.vx * dt;
      // Boundaries
      if (player.x - player.radius < 0) player.x = player.radius;
      if (player.x + player.radius > 800) player.x = 800 - player.radius;

      // Move player Y
      player.y += player.vy * dt;
      player.isGrounded = false;

      // Platform Collisions
      curLevelObj.platforms.forEach((plat) => {
        // Is platform solid for current color?
        const isSolid = plat.type === 'WHITE' || plat.type === colorModeRef.current;

        if (isSolid) {
          if (
            player.x + player.radius > plat.x &&
            player.x - player.radius < plat.x + plat.w &&
            player.y + player.radius >= plat.y &&
            player.y - player.radius < plat.y + plat.h
          ) {
            if (player.vy > 0 && player.y - player.vy * dt <= plat.y + 10) {
              player.y = plat.y - player.radius;
              player.vy = 0;
              player.isGrounded = true;
              player.jumpsRemaining = 2; // Reset double jump on land
            }
          }
        }
      });

      // Death check if fallen off bottom
      if (player.y > 520) {
        playSound('death');
        addParticles(player.x, player.y, '#f87171', 20);
        player.x = curLevelObj.spawn.x;
        player.y = curLevelObj.spawn.y;
        player.vx = 0;
        player.vy = 0;
      }

      // Laser Collisions
      curLevelObj.lasers.forEach((laser) => {
        // Laser is hazardous IF player color DOES NOT match laser color
        if (colorModeRef.current !== laser.type) {
          if (
            player.x + player.radius > laser.x &&
            player.x - player.radius < laser.x + laser.w &&
            player.y + player.radius > laser.y &&
            player.y - player.radius < laser.y + laser.h
          ) {
            playSound('death');
            addParticles(player.x, player.y, '#f87171', 25);
            player.x = curLevelObj.spawn.x;
            player.y = curLevelObj.spawn.y;
            player.vx = 0;
            player.vy = 0;
          }
        }
      });

      // Prism Collection
      curLevelObj.prisms.forEach((prism) => {
        if (!prism.collected) {
          const dx = player.x - prism.x;
          const dy = player.y - prism.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < player.radius + 15) {
            prism.collected = true;
            playSound('prism');
            setScore((prev) => prev + 250);
            setPrismsCollected((prev) => prev + 1);
            addParticles(prism.x, prism.y, prism.color === 'RED' ? '#ef4444' : prism.color === 'BLUE' ? '#3b82f6' : '#22c55e', 15);
          }
        }
      });

      // Exit Door Check
      const remainingPrisms = curLevelObj.prisms.filter((p) => !p.collected).length;
      if (remainingPrisms === 0) {
        const exit = curLevelObj.exit;
        if (
          player.x + player.radius > exit.x &&
          player.x - player.radius < exit.x + exit.w &&
          player.y + player.radius > exit.y &&
          player.y - player.radius < exit.y + exit.h
        ) {
          playSound('win');
          if (level < levelLayouts.length) {
            setLevel((prev) => prev + 1);
          } else {
            setGameState('win');
          }
        }
      }

      // ---------------- RENDER ----------------
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 800, 480);

      // Background Sci-Fi Grid Lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Draw Platforms
      curLevelObj.platforms.forEach((plat) => {
        let isSolid = plat.type === 'WHITE' || plat.type === colorModeRef.current;

        if (plat.type === 'WHITE') {
          ctx.fillStyle = '#64748b';
          ctx.shadowColor = '#94a3b8';
          ctx.shadowBlur = 4;
        } else if (plat.type === 'RED') {
          ctx.fillStyle = isSolid ? '#ef4444' : 'rgba(239, 68, 68, 0.25)';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = isSolid ? 12 : 2;
        } else if (plat.type === 'BLUE') {
          ctx.fillStyle = isSolid ? '#3b82f6' : 'rgba(59, 130, 246, 0.25)';
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = isSolid ? 12 : 2;
        } else if (plat.type === 'GREEN') {
          ctx.fillStyle = isSolid ? '#22c55e' : 'rgba(34, 197, 94, 0.25)';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = isSolid ? 12 : 2;
        }

        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        if (!isSolid) {
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
          ctx.setLineDash([]);
        }
      });

      // Draw Lasers
      curLevelObj.lasers.forEach((laser) => {
        const isSafe = colorModeRef.current === laser.type;
        ctx.fillStyle = laser.type === 'RED' ? '#ef4444' : laser.type === 'BLUE' ? '#3b82f6' : '#22c55e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = isSafe ? 4 : 20;

        ctx.globalAlpha = isSafe ? 0.35 : 0.9;
        ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
        ctx.globalAlpha = 1.0;
      });

      // Draw Prisms
      curLevelObj.prisms.forEach((prism) => {
        if (!prism.collected) {
          ctx.save();
          ctx.translate(prism.x, prism.y);
          ctx.rotate(time * 0.003);
          ctx.fillStyle = prism.color === 'RED' ? '#ef4444' : prism.color === 'BLUE' ? '#3b82f6' : '#22c55e';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 15;

          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.lineTo(10, 10);
          ctx.lineTo(-10, 10);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw Exit Portal
      const exit = curLevelObj.exit;
      const isUnlocked = remainingPrisms === 0;
      ctx.fillStyle = isUnlocked ? '#38bdf8' : '#334155';
      ctx.shadowColor = isUnlocked ? '#38bdf8' : 'transparent';
      ctx.shadowBlur = isUnlocked ? 20 : 0;
      ctx.fillRect(exit.x, exit.y, exit.w, exit.h);

      if (isUnlocked) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('EXIT', exit.x + 8, exit.y + 35);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText('LOCKED', exit.x + 2, exit.y + 35);
      }

      // Draw Player
      let playerColor = colorModeRef.current === 'RED' ? '#ef4444' : colorModeRef.current === 'BLUE' ? '#3b82f6' : '#22c55e';
      ctx.fillStyle = playerColor;
      ctx.shadowColor = playerColor;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner Core Glow
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Update & Draw Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 2;
        if (p.life <= 0) {
          particles.splice(idx, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, 4, 4);
          ctx.globalAlpha = 1.0;
        }
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, level]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 p-2 sm:p-4 text-sky-100 rounded-2xl">
      {/* Top Controls & Status Bar */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-2 px-2 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="text-sky-400 font-bold">Chamber {level} / 3</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">Score: {score}</span>
        </div>

        {/* Color Switch Selector Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-sky-500/20">
          <button
            onClick={() => handleShiftColor('RED')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              colorMode === 'RED'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105'
                : 'text-red-400 hover:bg-slate-800'
            }`}
          >
            1 RED
          </button>
          <button
            onClick={() => handleShiftColor('BLUE')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              colorMode === 'BLUE'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'text-blue-400 hover:bg-slate-800'
            }`}
          >
            2 BLUE
          </button>
          <button
            onClick={() => handleShiftColor('GREEN')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              colorMode === 'GREEN'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105'
                : 'text-emerald-400 hover:bg-slate-800'
            }`}
          >
            3 GREEN
          </button>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg bg-slate-900 text-sky-300 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Canvas Frame */}
      <div className="relative w-full max-w-[800px] aspect-[8/4.8] bg-slate-950 border-2 border-sky-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-sky-950/80">
        {gameState === 'start' && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-400/40 text-sky-300 animate-pulse">
              <Zap className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              COLOR PUZZLES
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 max-w-md">
              Containment Breach Alert! Shift your body's light wavelength between RED, BLUE, and GREEN to navigate phase platforms and survive spectrum lasers.
            </p>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-sky-500/20 text-xs text-sky-300 space-y-1 text-left">
              <p>🎮 <b>A / D or Arrow Keys</b>: Move Left & Right</p>
              <p>🚀 <b>W, Up Arrow, Space</b>: Jump</p>
              <p>🌈 <b>Keys 1, 2, 3 or Shift / C</b>: Shift Color Frequency</p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              INITIATE TEST CHAMBER
            </button>
          </div>
        )}

        {gameState === 'win' && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-400/40 text-emerald-300">
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              FACILITY CONTAINED!
            </h2>
            <p className="text-sm text-emerald-200">
              You successfully solved all chromatic puzzle chambers with a score of <b>{score}</b>!
            </p>
            <button
              onClick={handleStartGame}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              PLAY AGAIN
            </button>
          </div>
        )}

        <canvas ref={canvasRef} width={800} height={480} className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

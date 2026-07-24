import React, { useState, useEffect, useRef } from 'react';
import { ChromaIncidentEngine } from './ChromaIncidentEngine.jsx';
import { Play, RotateCcw, Trophy } from 'lucide-react';

// 2048 Built-In Game Component
const Engine2048 = () => {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [resultMsg, setResultMsg] = useState('Join the numbers and get to the 2048 tile!');
  const [hasWon, setHasWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const initBoard = () => {
    let b = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandom(b);
    addRandom(b);
    setBoard(b);
    setScore(0);
    setResultMsg('Join the numbers and get to the 2048 tile!');
    setHasWon(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initBoard();
  }, []);

  const addRandom = (b) => {
    let empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      let randCell = empty[Math.floor(Math.random() * empty.length)];
      b[randCell.r][randCell.c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const checkGameOver = (b) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  const slide = (row) => {
    let arr = row.filter((val) => val !== 0);
    let pts = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        pts += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { arr, pts };
  };

  const handleKey = (e) => {
    if (isGameOver) return;
    let newBoard = board.map((row) => [...row]);
    let moved = false;
    let addedPts = 0;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      for (let r = 0; r < 4; r++) {
        const { arr, pts } = slide(newBoard[r]);
        if (JSON.stringify(newBoard[r]) !== JSON.stringify(arr)) moved = true;
        newBoard[r] = arr;
        addedPts += pts;
      }
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      for (let r = 0; r < 4; r++) {
        let rev = [...newBoard[r]].reverse();
        const { arr, pts } = slide(rev);
        let finalRow = arr.reverse();
        if (JSON.stringify(newBoard[r]) !== JSON.stringify(finalRow)) moved = true;
        newBoard[r] = finalRow;
        addedPts += pts;
      }
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        const { arr, pts } = slide(col);
        if (JSON.stringify(col) !== JSON.stringify(arr)) moved = true;
        for (let r = 0; r < 4; r++) newBoard[r][c] = arr[r];
        addedPts += pts;
      }
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]].reverse();
        const { arr, pts } = slide(col);
        let finalCol = arr.reverse();
        let orig = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (JSON.stringify(orig) !== JSON.stringify(finalCol)) moved = true;
        for (let r = 0; r < 4; r++) newBoard[r][c] = finalCol[r];
        addedPts += pts;
      }
    } else {
      return;
    }

    if (moved) {
      addRandom(newBoard);
      setBoard(newBoard);
      setScore((s) => s + addedPts);

      let won = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (newBoard[r][c] === 2048) won = true;
        }
      }

      if (won && !hasWon) {
        setHasWon(true);
        setResultMsg('🎉 Congratulations! You reached the 2048 tile!');
      }

      if (checkGameOver(newBoard)) {
        setIsGameOver(true);
        setResultMsg('Game Over! No more available moves.');
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [board, isGameOver, hasWon]);

  const getTileStyle = (val) => {
    switch (val) {
      case 2: return 'bg-amber-100 text-amber-900 border-amber-200';
      case 4: return 'bg-amber-200 text-amber-900 border-amber-300';
      case 8: return 'bg-orange-400 text-white border-orange-300';
      case 16: return 'bg-orange-500 text-white border-orange-400';
      case 32: return 'bg-orange-600 text-white border-orange-500';
      case 64: return 'bg-red-500 text-white border-red-400';
      case 128: return 'bg-amber-400 text-white border-amber-200 shadow-lg shadow-amber-500/50';
      case 256: return 'bg-amber-500 text-white border-amber-300 shadow-lg shadow-amber-500/60';
      case 512: return 'bg-yellow-500 text-white border-yellow-200 shadow-lg shadow-yellow-500/70';
      case 1024: return 'bg-yellow-400 text-white border-yellow-100 shadow-xl shadow-yellow-400/80';
      case 2048: return 'bg-yellow-300 text-amber-950 border-white shadow-xl shadow-yellow-300/90 animate-pulse font-extrabold';
      default: return 'bg-slate-900/60 border-slate-800/80';
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950 text-white rounded-2xl w-full h-full min-h-[420px]">
      <div className="info flex items-center justify-between w-full max-w-xs mb-3">
        <h1 className="text-3xl font-black tracking-wider text-amber-400">2048</h1>
        <div className="flex items-center gap-3">
          <div className="score-container bg-slate-900 border border-amber-500/30 px-3 py-1 rounded-xl text-center">
            <p className="score-title text-[10px] uppercase font-bold text-amber-400 tracking-wider">score</p>
            <h2 id="score" className="text-lg font-extrabold text-white leading-tight">{score}</h2>
          </div>
          <button
            onClick={initBoard}
            className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all font-bold shadow-md hover:scale-105"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p id="result" className="text-xs text-amber-200/90 mb-4 text-center font-medium max-w-xs">
        {resultMsg.includes('2048') ? (
          <>Join the numbers and get to the <b className="text-amber-400 font-extrabold">2048</b> tile!</>
        ) : (
          resultMsg
        )}
      </p>

      <div className="grid grid-cols-4 gap-2.5 bg-slate-900/90 p-3 rounded-2xl border border-amber-500/30 w-full max-w-xs aspect-square shadow-2xl relative overflow-hidden">
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex items-center justify-center font-black text-lg sm:text-xl rounded-xl border transition-all duration-100 select-none ${getTileStyle(
                val
              )}`}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 animate-fade-in">
            <p className="text-red-400 font-black text-xl mb-1">Game Over!</p>
            <p className="text-amber-200/80 text-xs mb-3">No more moves remaining</p>
            <button
              onClick={initBoard}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-amber-300/70 mt-4 text-center">Use WASD or Arrow Keys to move tiles.</p>
    </div>
  );
};

// Snake Built-In Game Component
const EngineSnake = () => {
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        let head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setGameOver(true);
          return prev;
        }
        for (let s of prev) {
          if (s.x === head.x && s.y === head.y) {
            setGameOver(true);
            return prev;
          }
        }
        let newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [dir, food, gameOver]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y === 0) setDir({ x: 0, y: -1 });
      if ((e.key === 'ArrowDown' || e.key === 's') && dir.y === 0) setDir({ x: 0, y: 1 });
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x === 0) setDir({ x: -1, y: 0 });
      if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x === 0) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  const resetSnake = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ]);
    setDir({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-white rounded-2xl w-full h-full min-h-[400px]">
      <div className="flex items-center justify-between w-full max-w-xs mb-3">
        <span className="text-xs text-sky-400 font-bold uppercase">Snake Score: {score}</span>
        <button
          onClick={resetSnake}
          className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold"
        >
          Reset
        </button>
      </div>

      <div className="relative grid grid-cols-20 grid-rows-20 gap-0.5 bg-slate-900 border border-sky-500/30 w-full max-w-xs aspect-square p-2 rounded-2xl">
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-10 rounded-2xl">
            <p className="text-red-400 font-black text-lg">GAME OVER</p>
            <button onClick={resetSnake} className="px-4 py-1.5 bg-sky-500 text-white text-xs font-bold rounded-xl">
              Try Again
            </button>
          </div>
        )}
        {Array.from({ length: 400 }).map((_, i) => {
          const x = i % 20;
          const y = Math.floor(i / 20);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`rounded-sm ${
                isHead
                  ? 'bg-sky-300 shadow-md shadow-sky-300/50'
                  : isSnake
                  ? 'bg-sky-500'
                  : isFood
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-slate-950/50'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

// Flappy Tinybird Built-In Canvas Engine Component
const EngineFlappy = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappy_high_score') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'menu',
    score: 0,
    birdY: 200,
    velocity: 0,
    rotation: 0,
    pipes: [],
    frame: 0,
    groundX: 0,
    wingAngle: 0
  });

  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'flap') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'score') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio fallback
    }
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.gameState === 'menu' || s.gameState === 'gameover') {
      s.birdY = 200;
      s.velocity = -6.5;
      s.rotation = -20;
      s.pipes = [
        { x: 380, top: 120, bottom: 140, passed: false },
        { x: 560, top: 160, bottom: 100, passed: false }
      ];
      s.score = 0;
      s.gameState = 'playing';
      setScore(0);
      setGameState('playing');
      playSound('flap');
      return;
    }

    if (s.gameState === 'playing') {
      s.velocity = -6.5;
      s.rotation = -25;
      playSound('flap');
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const WIDTH = 360;
    const HEIGHT = 480;
    const GRAVITY = 0.38;
    const GROUND_HEIGHT = 70;

    const loop = () => {
      const s = stateRef.current;
      s.frame++;

      // Sky Background
      const skyGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      skyGradient.addColorStop(0, '#38bdf8');
      skyGradient.addColorStop(0.6, '#7dd3fc');
      skyGradient.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const cloudOffset = (s.frame * 0.4) % WIDTH;
      ctx.beginPath();
      ctx.arc((80 - cloudOffset + WIDTH) % WIDTH, 80, 24, 0, Math.PI * 2);
      ctx.arc((110 - cloudOffset + WIDTH) % WIDTH, 70, 30, 0, Math.PI * 2);
      ctx.arc((140 - cloudOffset + WIDTH) % WIDTH, 80, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc((260 - cloudOffset + WIDTH) % WIDTH, 120, 20, 0, Math.PI * 2);
      ctx.arc((285 - cloudOffset + WIDTH) % WIDTH, 110, 26, 0, Math.PI * 2);
      ctx.arc((310 - cloudOffset + WIDTH) % WIDTH, 120, 20, 0, Math.PI * 2);
      ctx.fill();

      if (s.gameState === 'playing') {
        // Update Bird
        s.velocity += GRAVITY;
        s.birdY += s.velocity;
        s.rotation = Math.min(Math.max(s.rotation + 2.5, -30), 70);

        // Ground collision
        if (s.birdY + 14 >= HEIGHT - GROUND_HEIGHT) {
          s.birdY = HEIGHT - GROUND_HEIGHT - 14;
          s.gameState = 'gameover';
          setGameState('gameover');
          playSound('hit');
        }

        // Ceiling collision
        if (s.birdY - 14 <= 0) {
          s.birdY = 14;
          s.velocity = 0;
        }

        // Move Ground
        s.groundX = (s.groundX + 2.5) % 24;

        // Move Pipes
        s.pipes.forEach((p) => {
          p.x -= 2.5;

          // Check Score
          if (!p.passed && p.x + 26 < 90) {
            p.passed = true;
            s.score += 1;
            setScore(s.score);
            playSound('score');
            if (s.score > highScore) {
              setHighScore(s.score);
              localStorage.setItem('flappy_high_score', s.score.toString());
            }
          }

          // Check Pipe Collision
          const birdX = 90;
          const birdRadius = 13;
          if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + 52) {
            if (s.birdY - birdRadius < p.top || s.birdY + birdRadius > HEIGHT - GROUND_HEIGHT - p.bottom) {
              s.gameState = 'gameover';
              setGameState('gameover');
              playSound('hit');
            }
          }
        });

        // Spawn new pipes
        if (s.pipes.length > 0 && s.pipes[0].x < -60) {
          s.pipes.shift();
          const topGap = Math.floor(Math.random() * 140) + 60;
          const bottomGap = HEIGHT - GROUND_HEIGHT - topGap - 120;
          s.pipes.push({
            x: s.pipes[s.pipes.length - 1].x + 180,
            top: topGap,
            bottom: bottomGap,
            passed: false
          });
        }
      }

      // Draw Pipes
      s.pipes.forEach((p) => {
        // Top Pipe
        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + 52, 0);
        pipeGrad.addColorStop(0, '#22c55e');
        pipeGrad.addColorStop(0.5, '#4ade80');
        pipeGrad.addColorStop(1, '#15803d');

        ctx.fillStyle = pipeGrad;
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 3;

        // Body top
        ctx.fillRect(p.x, 0, 52, p.top);
        ctx.strokeRect(p.x, 0, 52, p.top);

        // Cap top
        ctx.fillRect(p.x - 4, p.top - 24, 60, 24);
        ctx.strokeRect(p.x - 4, p.top - 24, 60, 24);

        // Bottom Pipe
        const bottomY = HEIGHT - GROUND_HEIGHT - p.bottom;
        ctx.fillRect(p.x, bottomY, 52, p.bottom);
        ctx.strokeRect(p.x, bottomY, 52, p.bottom);

        // Cap bottom
        ctx.fillRect(p.x - 4, bottomY, 60, 24);
        ctx.strokeRect(p.x - 4, bottomY, 60, 24);
      });

      // Draw Ground
      const groundY = HEIGHT - GROUND_HEIGHT;
      ctx.fillStyle = '#fde047'; // Sand
      ctx.fillRect(0, groundY, WIDTH, GROUND_HEIGHT);

      ctx.fillStyle = '#16a34a'; // Grass top
      ctx.fillRect(0, groundY, WIDTH, 16);

      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(WIDTH, groundY);
      ctx.stroke();

      // Grass pattern stripes
      ctx.fillStyle = '#22c55e';
      for (let x = -s.groundX; x < WIDTH + 24; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 12, groundY);
        ctx.lineTo(x + 6, groundY + 16);
        ctx.fill();
      }

      // Draw Tinybird
      ctx.save();
      ctx.translate(90, s.birdY);
      ctx.rotate((s.rotation * Math.PI) / 180);

      // Bird Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(2, 16, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bird Body (Bright Yellow Tinybird)
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Belly
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-2, 3, 9, 0, Math.PI);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(5, -4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(6.5, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(11, -1);
      ctx.lineTo(19, 2);
      ctx.lineTo(11, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing
      s.wingAngle = s.gameState === 'playing' ? Math.sin(s.frame * 0.4) * 8 : 0;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(-5, 2, 7, 4, (s.wingAngle * Math.PI) / 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // Score Display in top center
      if (s.gameState === 'playing') {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.font = '900 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(s.score.toString(), WIDTH / 2, 60);
        ctx.fillText(s.score.toString(), WIDTH / 2, 60);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [highScore]);

  return (
    <div
      onClick={jump}
      className="relative flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-950 text-white rounded-2xl w-full h-full min-h-[420px] select-none cursor-pointer overflow-hidden border border-sky-500/30"
    >
      <div className="flex items-center justify-between w-full max-w-[360px] mb-2 z-10 px-1">
        <span className="text-xs text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-base">🐤</span> Flappy Tinybird
        </span>
        <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
          Best: {highScore}
        </span>
      </div>

      <div className="relative w-full max-w-[360px] aspect-[360/480] rounded-2xl overflow-hidden shadow-2xl border-2 border-sky-500/40 bg-slate-900">
        <canvas ref={canvasRef} width={360} height={480} className="w-full h-full block" />

        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 animate-fade-in">
            <div className="text-4xl animate-bounce">🐤</div>
            <h2 className="text-2xl font-black text-amber-400 drop-shadow-md">Flappy Tinybird</h2>
            <p className="text-xs text-sky-200/90 font-medium max-w-[220px]">
              Tap screen or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono">Space</kbd> to fly!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                jump();
              }}
              className="mt-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Start Flying
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 animate-fade-in">
            <p className="text-red-400 font-black text-2xl tracking-wide drop-shadow">GAME OVER</p>
            <div className="bg-slate-900/90 border border-sky-500/30 px-6 py-3 rounded-2xl space-y-1 shadow-inner w-48">
              <p className="text-xs text-sky-300 font-semibold uppercase">Score: <span className="text-white font-extrabold text-sm">{score}</span></p>
              <p className="text-xs text-amber-400 font-semibold uppercase">High Score: <span className="text-white font-extrabold text-sm">{highScore}</span></p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                jump();
              }}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-sky-300/80 mt-2 z-10">Click anywhere or press Space/W/Up Arrow to flap wings</p>
    </div>
  );
};

// 3D Neon Slope Game Canvas Engine
const EngineSlope = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('slope_high_score') || '0', 10);
  });

  const keysRef = useRef({ left: false, right: false });

  const stateRef = useRef({
    gameState: 'menu',
    score: 0,
    ball: {
      x: 0,
      y: 12,
      z: 0,
      radius: 10,
      vx: 0,
      vy: 0,
      speed: 4.5,
      roll: 0,
      isGrounded: true
    },
    segments: [],
    particles: [],
    frame: 0
  });

  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'start') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio fallback
    }
  };

  const generateInitialTrack = () => {
    const segs = [];
    let currentZ = 0;

    // Initial safe runway
    segs.push({
      xCenter: 0,
      width: 140,
      zStart: 0,
      zLength: 300,
      yStart: 0,
      yEnd: -150,
      obstacles: []
    });

    currentZ = 300;

    // Generate procedurally ahead
    for (let i = 0; i < 15; i++) {
      const lastSeg = segs[segs.length - 1];
      const width = Math.max(90, 140 - i * 3);
      const zLength = Math.floor(Math.random() * 150) + 180;
      const xOffset = (Math.random() - 0.5) * 80;
      const xCenter = Math.max(-100, Math.min(100, lastSeg.xCenter + xOffset));
      const yDrop = Math.floor(Math.random() * 80) + 100;

      // Obstacles inside this segment
      const obstacles = [];
      if (i > 1) {
        const obsCount = Math.floor(Math.random() * 3) + 1;
        for (let o = 0; o < obsCount; o++) {
          const obsZ = lastSeg.zStart + (o + 1) * (zLength / (obsCount + 1));
          const obsX = xCenter + (Math.random() - 0.5) * (width - 30);
          obstacles.push({
            x: obsX,
            z: obsZ,
            w: 18,
            h: 22,
            d: 18
          });
        }
      }

      segs.push({
        xCenter,
        width,
        zStart: currentZ,
        zLength,
        yStart: lastSeg.yEnd,
        yEnd: lastSeg.yEnd - yDrop,
        obstacles
      });

      currentZ += zLength;
    }

    return segs;
  };

  const startGame = () => {
    const s = stateRef.current;
    s.gameState = 'playing';
    s.score = 0;
    s.ball = {
      x: 0,
      y: 12,
      z: 0,
      radius: 10,
      vx: 0,
      vy: 0,
      speed: 4.5,
      roll: 0,
      isGrounded: true
    };
    s.segments = generateInitialTrack();
    s.particles = [];
    s.frame = 0;

    setScore(0);
    setGameState('playing');
    playSound('start');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if ((e.code === 'Space' || e.code === 'Enter') && stateRef.current.gameState !== 'playing') {
        startGame();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const WIDTH = 600;
    const HEIGHT = 420;
    const FOV = 280;

    const project = (x, y, z, camX, camY, camZ) => {
      const relX = x - camX;
      const relY = y - camY;
      const relZ = z - camZ;

      if (relZ <= 5) return null;

      const scale = FOV / relZ;
      return {
        x: WIDTH / 2 + relX * scale,
        y: HEIGHT / 2 - relY * scale,
        scale,
        relZ
      };
    };

    const triggerExplosion = (x, y, z) => {
      const parts = [];
      for (let i = 0; i < 35; i++) {
        parts.push({
          x, y, z,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 8 + 2,
          vz: (Math.random() - 0.5) * 8,
          color: Math.random() > 0.5 ? '#ef4444' : '#06b6d4',
          size: Math.random() * 5 + 3,
          life: 1.0
        });
      }
      stateRef.current.particles = parts;
    };

    const loop = () => {
      const s = stateRef.current;
      s.frame++;

      // Background Cyber Sky
      const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.6, '#090d16');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137) % WIDTH);
        const sy = ((i * 93) % (HEIGHT * 0.6));
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (s.gameState === 'playing') {
        // Handle Lateral Controls
        if (keysRef.current.left) s.ball.vx = Math.max(-5.5, s.ball.vx - 0.6);
        else if (keysRef.current.right) s.ball.vx = Math.min(5.5, s.ball.vx + 0.6);
        else s.ball.vx *= 0.82; // damping

        s.ball.x += s.ball.vx;
        s.ball.z += s.ball.speed;
        s.ball.speed += 0.0015; // gradually speed up!
        s.ball.roll += s.ball.speed * 0.1;

        // Current Score
        s.score = Math.floor(s.ball.z / 10);
        setScore(s.score);
        if (s.score > highScore) {
          setHighScore(s.score);
          localStorage.setItem('slope_high_score', s.score.toString());
        }

        // Find active segment under ball
        const currentSeg = s.segments.find(
          (seg) => s.ball.z >= seg.zStart && s.ball.z < seg.zStart + seg.zLength
        );

        if (currentSeg) {
          // Calculate track elevation at current Z
          const progress = (s.ball.z - currentSeg.zStart) / currentSeg.zLength;
          const targetY = currentSeg.yStart + progress * (currentSeg.yEnd - currentSeg.yStart) + s.ball.radius;

          // Check lateral boundaries (falling off side)
          const leftBoundary = currentSeg.xCenter - currentSeg.width / 2;
          const rightBoundary = currentSeg.xCenter + currentSeg.width / 2;

          if (s.ball.x < leftBoundary || s.ball.x > rightBoundary) {
            s.ball.isGrounded = false;
          } else {
            s.ball.isGrounded = true;
            s.ball.y = targetY;
            s.ball.vy = 0;
          }

          // Check Red Obstacle Collision
          currentSeg.obstacles.forEach((obs) => {
            if (Math.abs(s.ball.z - obs.z) < obs.d && Math.abs(s.ball.x - obs.x) < obs.w) {
              s.gameState = 'gameover';
              setGameState('gameover');
              playSound('crash');
              triggerExplosion(s.ball.x, s.ball.y, s.ball.z);
            }
          });
        } else {
          // Off track (between gap or ended)
          s.ball.isGrounded = false;
        }

        // Gravity pull if falling
        if (!s.ball.isGrounded) {
          s.ball.vy -= 0.6;
          s.ball.y += s.ball.vy;

          if (s.ball.y < -350) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playSound('crash');
          }
        }

        // Generate endless track segments
        const lastSeg = s.segments[s.segments.length - 1];
        if (lastSeg.zStart < s.ball.z + 1200) {
          const width = Math.max(80, 140 - Math.min(60, s.segments.length * 1.5));
          const zLength = Math.floor(Math.random() * 160) + 200;
          const xOffset = (Math.random() - 0.5) * 110;
          const xCenter = Math.max(-120, Math.min(120, lastSeg.xCenter + xOffset));
          const yDrop = Math.floor(Math.random() * 90) + 100;

          const obstacles = [];
          const obsCount = Math.floor(Math.random() * 3) + 1;
          for (let o = 0; o < obsCount; o++) {
            const obsZ = lastSeg.zStart + lastSeg.zLength + (o + 1) * (zLength / (obsCount + 1));
            const obsX = xCenter + (Math.random() - 0.5) * (width - 32);
            obstacles.push({
              x: obsX,
              z: obsZ,
              w: 18,
              h: 22,
              d: 18
            });
          }

          s.segments.push({
            xCenter,
            width,
            zStart: lastSeg.zStart + lastSeg.zLength,
            zLength,
            yStart: lastSeg.yEnd,
            yEnd: lastSeg.yEnd - yDrop,
            obstacles
          });
        }

        // Clean up old segments behind camera
        if (s.segments.length > 20) {
          s.segments = s.segments.filter((seg) => seg.zStart + seg.zLength > s.ball.z - 200);
        }
      }

      // Camera Setup
      const camX = s.ball.x * 0.35;
      const camY = s.ball.y + 45;
      const camZ = s.ball.z - 90;

      // Render Track Segments
      s.segments.forEach((seg) => {
        if (seg.zStart + seg.zLength < camZ) return;

        const leftX = seg.xCenter - seg.width / 2;
        const rightX = seg.xCenter + seg.width / 2;

        const steps = 6;
        for (let i = 0; i < steps; i++) {
          const z1 = seg.zStart + (i * seg.zLength) / steps;
          const z2 = seg.zStart + ((i + 1) * seg.zLength) / steps;

          const prog1 = (z1 - seg.zStart) / seg.zLength;
          const prog2 = (z2 - seg.zStart) / seg.zLength;

          const y1 = seg.yStart + prog1 * (seg.yEnd - seg.yStart);
          const y2 = seg.yStart + prog2 * (seg.yEnd - seg.yStart);

          const pTL = project(leftX, y1, z1, camX, camY, camZ);
          const pTR = project(rightX, y1, z1, camX, camY, camZ);
          const pBL = project(leftX, y2, z2, camX, camY, camZ);
          const pBR = project(rightX, y2, z2, camX, camY, camZ);

          if (pTL && pTR && pBL && pBR) {
            // Polygon fill
            ctx.fillStyle = i % 2 === 0 ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.95)';
            ctx.beginPath();
            ctx.moveTo(pTL.x, pTL.y);
            ctx.lineTo(pTR.x, pTR.y);
            ctx.lineTo(pBR.x, pBR.y);
            ctx.lineTo(pBL.x, pBL.y);
            ctx.closePath();
            ctx.fill();

            // Neon cyan edge glow
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = Math.max(1, pTL.scale * 1.5);
            ctx.beginPath();
            ctx.moveTo(pTL.x, pTL.y);
            ctx.lineTo(pBL.x, pBL.y);
            ctx.moveTo(pTR.x, pTR.y);
            ctx.lineTo(pBR.x, pBR.y);
            ctx.stroke();

            // Grid crosslines
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.beginPath();
            ctx.moveTo(pTL.x, pTL.y);
            ctx.lineTo(pTR.x, pTR.y);
            ctx.stroke();
          }
        }

        // Render Red Obstacles inside segment
        seg.obstacles.forEach((obs) => {
          if (obs.z < camZ + 5) return;

          const pFront = project(obs.x, obs.y || (seg.yStart + ((obs.z - seg.zStart) / seg.zLength) * (seg.yEnd - seg.yStart)), obs.z, camX, camY, camZ);
          if (!pFront) return;

          const size = obs.w * pFront.scale;

          // Render 3D Red Box
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 10;
          ctx.fillRect(pFront.x - size / 2, pFront.y - size, size, size);
          ctx.shadowBlur = 0;

          ctx.strokeStyle = '#fef2f2';
          ctx.lineWidth = Math.max(1, size * 0.08);
          ctx.strokeRect(pFront.x - size / 2, pFront.y - size, size, size);
        });
      });

      // Render Rolling Ball
      const pBall = project(s.ball.x, s.ball.y, s.ball.z, camX, camY, camZ);
      if (pBall) {
        const r = s.ball.radius * pBall.scale;

        // Ball Glow
        const radGrad = ctx.createRadialGradient(pBall.x, pBall.y, r * 0.2, pBall.x, pBall.y, r * 1.8);
        radGrad.addColorStop(0, '#38bdf8');
        radGrad.addColorStop(0.5, '#0284c7');
        radGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(pBall.x, pBall.y, r * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Core Ball
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, r * 0.15);
        ctx.beginPath();
        ctx.arc(pBall.x, pBall.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Roll stripe details
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(pBall.x, pBall.y, r * 0.6, s.ball.roll, s.ball.roll + Math.PI);
        ctx.stroke();
      }

      // Render Particles
      s.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.life -= 0.02;

        const proj = project(p.x, p.y, p.z, camX, camY, camZ);
        if (proj && p.life > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, p.size * proj.scale * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // Draw Hud Overlay inside Canvas
      if (s.gameState === 'playing') {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${s.score}`, 20, 36);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [highScore]);

  return (
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-950 text-white rounded-2xl w-full h-full min-h-[420px] select-none overflow-hidden border border-sky-500/30">
      <div className="flex items-center justify-between w-full max-w-[600px] mb-2 z-10 px-1">
        <span className="text-xs text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-base">🌐</span> Slope 3D Neon
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Best: {highScore}
          </span>
          <button
            onClick={startGame}
            className="p-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-all font-bold shadow-md hover:scale-105"
            title="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-[600px] aspect-[600/420] rounded-2xl overflow-hidden shadow-2xl border-2 border-sky-500/40 bg-slate-950">
        <canvas ref={canvasRef} width={600} height={420} className="w-full h-full block" />

        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4 z-10 animate-fade-in">
            <div className="text-5xl animate-pulse">🌐</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 drop-shadow-md">
              Slope 3D
            </h2>
            <p className="text-xs text-sky-200/90 font-medium max-w-xs">
              Steer the neon sphere down steep endless tracks! Avoid red blocks and falling off the edge.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Start Rolling
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4 z-10 animate-fade-in">
            <p className="text-red-400 font-black text-3xl tracking-wide drop-shadow-lg">CRASHED!</p>
            <div className="bg-slate-900/90 border border-sky-500/30 px-8 py-4 rounded-2xl space-y-1.5 shadow-inner w-56">
              <p className="text-xs text-sky-300 font-semibold uppercase">Score: <span className="text-white font-extrabold text-base">{score}</span></p>
              <p className="text-xs text-amber-400 font-semibold uppercase">High Score: <span className="text-white font-extrabold text-base">{highScore}</span></p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full max-w-[600px] mt-2 text-[11px] text-sky-300/80 px-1">
        <span>Controls: <kbd className="px-1 bg-slate-800 rounded border border-slate-700 font-mono">A</kbd> / <kbd className="px-1 bg-slate-800 rounded border border-slate-700 font-mono">D</kbd> or <kbd className="px-1 bg-slate-800 rounded border border-slate-700 font-mono">Left</kbd> / <kbd className="px-1 bg-slate-800 rounded border border-slate-700 font-mono">Right</kbd> Arrow Keys</span>
      </div>
    </div>
  );
};

// 2D Paper.io 2 Canvas Engine
const EnginePaperIo2 = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [playerCoverage, setPlayerCoverage] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseFloat(localStorage.getItem('paper_io_2_high_score') || '0.0');
  });
  const [leaderboard, setLeaderboard] = useState([]);

  const keysRef = useRef({ dir: { x: 1, y: 0 } });

  const stateRef = useRef({
    gameState: 'menu',
    gridWidth: 80,
    gridHeight: 60,
    grid: [],
    players: [],
    particles: [],
    frame: 0,
  });

  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'claim') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'kill') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Fallback
    }
  };

  const BOT_CONFIGS = [
    { id: 1, name: 'You (Player)', color: '#38bdf8', trailColor: '#0284c7', isPlayer: true },
    { id: 2, name: 'NeonPulse', color: '#ef4444', trailColor: '#dc2626', isPlayer: false },
    { id: 3, name: 'CyberBlade', color: '#10b981', trailColor: '#059669', isPlayer: false },
    { id: 4, name: 'VortexAI', color: '#f59e0b', trailColor: '#d97706', isPlayer: false },
    { id: 5, name: 'ShadowByte', color: '#a855f7', trailColor: '#7e22ce', isPlayer: false },
  ];

  const spawnInitialTerritory = (grid, id, centerX, centerY, radius = 3) => {
    const GW = 80;
    const GH = 60;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius + 1) {
          const gx = Math.max(0, Math.min(GW - 1, centerX + dx));
          const gy = Math.max(0, Math.min(GH - 1, centerY + dy));
          grid[gy][gx] = id;
        }
      }
    }
  };

  const initGame = () => {
    const GW = 80;
    const GH = 60;
    const grid = Array(GH).fill(0).map(() => Array(GW).fill(0));

    const spawnPositions = [
      { x: 15, y: 15 },
      { x: 65, y: 15 },
      { x: 15, y: 45 },
      { x: 65, y: 45 },
      { x: 40, y: 30 },
    ];

    const players = BOT_CONFIGS.map((cfg, idx) => {
      const pos = spawnPositions[idx];
      spawnInitialTerritory(grid, cfg.id, pos.x, pos.y, 3);
      return {
        ...cfg,
        x: pos.x,
        y: pos.y,
        dx: idx === 0 ? 1 : (Math.random() > 0.5 ? 1 : -1),
        dy: idx === 0 ? 0 : (Math.random() > 0.5 ? 1 : -1),
        trail: [],
        alive: true,
        score: 0,
        aiTimer: 0,
      };
    });

    stateRef.current.gridWidth = GW;
    stateRef.current.gridHeight = GH;
    stateRef.current.grid = grid;
    stateRef.current.players = players;
    stateRef.current.particles = [];
    stateRef.current.frame = 0;
    stateRef.current.gameState = 'playing';

    keysRef.current.dir = { x: 1, y: 0 };
    setPlayerCoverage(0);
    setGameState('playing');
    playSound('start');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const dir = keysRef.current.dir;
      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && dir.y !== 1) {
        keysRef.current.dir = { x: 0, y: -1 };
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && dir.y !== -1) {
        keysRef.current.dir = { x: 0, y: 1 };
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && dir.x !== 1) {
        keysRef.current.dir = { x: -1, y: 0 };
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && dir.x !== -1) {
        keysRef.current.dir = { x: 1, y: 0 };
      } else if ((e.code === 'Space' || e.code === 'Enter') && stateRef.current.gameState !== 'playing') {
        initGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const GW = 80;
    const GH = 60;
    const CELL = 8;

    const claimEnclosedTerritory = (grid, id, trail) => {
      if (trail.length === 0) return;

      trail.forEach((pt) => {
        if (pt.x >= 0 && pt.x < GW && pt.y >= 0 && pt.y < GH) {
          grid[pt.y][pt.x] = id;
        }
      });

      const visited = Array(GH).fill(0).map(() => Array(GW).fill(false));
      const queue = [];

      for (let x = 0; x < GW; x++) {
        if (grid[0][x] !== id) { queue.push({ x, y: 0 }); visited[0][x] = true; }
        if (grid[GH - 1][x] !== id) { queue.push({ x, y: GH - 1 }); visited[GH - 1][x] = true; }
      }
      for (let y = 0; y < GH; y++) {
        if (grid[y][0] !== id) { queue.push({ x: 0, y }); visited[y][0] = true; }
        if (grid[y][GW - 1] !== id) { queue.push({ x: GW - 1, y }); visited[y][GW - 1] = true; }
      }

      let head = 0;
      while (head < queue.length) {
        const { x, y } = queue[head++];
        const neighbors = [
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 },
        ];

        neighbors.forEach((n) => {
          if (n.x >= 0 && n.x < GW && n.y >= 0 && n.y < GH) {
            if (!visited[n.y][n.x] && grid[n.y][n.x] !== id) {
              visited[n.y][n.x] = true;
              queue.push(n);
            }
          }
        });
      }

      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          if (!visited[y][x] && grid[y][x] !== id) {
            grid[y][x] = id;
          }
        }
      }
    };

    const killPlayer = (p, grid, particles) => {
      p.alive = false;
      p.trail = [];

      for (let i = 0; i < 25; i++) {
        particles.push({
          x: p.x * CELL + CELL / 2,
          y: p.y * CELL + CELL / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: p.color,
          size: Math.random() * 4 + 2,
          life: 1.0,
        });
      }

      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          if (grid[y][x] === p.id) {
            grid[y][x] = 0;
          }
        }
      }
    };

    const loop = () => {
      const s = stateRef.current;
      s.frame++;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 640, 480);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= GW; x += 4) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, 480);
        ctx.stroke();
      }
      for (let y = 0; y <= GH; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(640, y * CELL);
        ctx.stroke();
      }

      if (s.gameState === 'playing') {
        const grid = s.grid;

        s.players.forEach((p) => {
          if (!p.alive) return;

          if (!p.isPlayer) {
            p.aiTimer++;
            if (p.aiTimer > Math.floor(Math.random() * 20) + 10) {
              p.aiTimer = 0;
              const dirs = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 },
              ].filter((d) => !(d.x === -p.dx && d.y === -p.dy));

              if (p.trail.length > 20) {
                const turn = dirs.find((d) => {
                  const nx = Math.max(0, Math.min(GW - 1, p.x + d.x * 3));
                  const ny = Math.max(0, Math.min(GH - 1, p.y + d.y * 3));
                  return grid[ny][nx] === p.id;
                });
                if (turn) { p.dx = turn.x; p.dy = turn.y; }
                else { const pick = dirs[Math.floor(Math.random() * dirs.length)]; p.dx = pick.x; p.dy = pick.y; }
              } else {
                const pick = dirs[Math.floor(Math.random() * dirs.length)];
                p.dx = pick.x;
                p.dy = pick.y;
              }
            }
          } else {
            p.dx = keysRef.current.dir.x;
            p.dy = keysRef.current.dir.y;
          }

          const nextX = Math.max(0, Math.min(GW - 1, p.x + p.dx));
          const nextY = Math.max(0, Math.min(GH - 1, p.y + p.dy));

          p.x = nextX;
          p.y = nextY;

          const currentOwner = grid[p.y][p.x];

          if (currentOwner !== p.id) {
            const selfCut = p.trail.some((pt) => pt.x === p.x && pt.y === p.y);
            if (selfCut) {
              killPlayer(p, grid, s.particles);
              playSound('kill');
              if (p.isPlayer) {
                s.gameState = 'gameover';
                setGameState('gameover');
              }
              return;
            }

            p.trail.push({ x: p.x, y: p.y });
          } else if (p.trail.length > 0) {
            claimEnclosedTerritory(grid, p.id, p.trail);
            p.trail = [];
            if (p.isPlayer) playSound('claim');
          }

          s.players.forEach((other) => {
            if (!other.alive || other.trail.length === 0) return;
            const hitIndex = other.trail.findIndex((pt) => pt.x === p.x && pt.y === p.y);
            if (hitIndex !== -1) {
              killPlayer(other, grid, s.particles);
              playSound('kill');
              if (other.isPlayer) {
                s.gameState = 'gameover';
                setGameState('gameover');
              }
            }
          });
        });

        s.players.forEach((p) => {
          if (!p.alive && !p.isPlayer && Math.random() < 0.01) {
            const rx = Math.floor(Math.random() * (GW - 20)) + 10;
            const ry = Math.floor(Math.random() * (GH - 20)) + 10;
            spawnInitialTerritory(grid, p.id, rx, ry, 3);
            p.x = rx;
            p.y = ry;
            p.alive = true;
            p.trail = [];
          }
        });

        const counts = Array(6).fill(0);
        for (let y = 0; y < GH; y++) {
          for (let x = 0; x < GW; x++) {
            counts[grid[y][x]]++;
          }
        }

        const totalCells = GW * GH;
        const leaderData = s.players
          .map((p) => ({
            name: p.name,
            color: p.color,
            pct: ((counts[p.id] / totalCells) * 100).toFixed(1),
            isPlayer: p.isPlayer,
            alive: p.alive,
          }))
          .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

        setLeaderboard(leaderData);

        const playerPct = parseFloat(((counts[1] / totalCells) * 100).toFixed(1));
        setPlayerCoverage(playerPct);
        if (playerPct > highScore) {
          setHighScore(playerPct);
          localStorage.setItem('paper_io_2_high_score', playerPct.toString());
        }
      }

      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          const ownerId = s.grid[y][x];
          if (ownerId > 0) {
            const ownerConfig = BOT_CONFIGS.find((b) => b.id === ownerId);
            if (ownerConfig) {
              ctx.fillStyle = ownerConfig.color + '66';
              ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            }
          }
        }
      }

      s.players.forEach((p) => {
        if (!p.alive) return;

        if (p.trail.length > 0) {
          ctx.fillStyle = p.trailColor;
          p.trail.forEach((pt) => {
            ctx.fillRect(pt.x * CELL + 1, pt.y * CELL + 1, CELL - 2, CELL - 2);
          });
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x * CELL - 1, p.y * CELL - 1, CELL + 2, CELL + 2);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x * CELL - 1, p.y * CELL - 1, CELL + 2, CELL + 2);
      });

      s.particles.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;
        if (pt.life > 0) {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.life;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [highScore]);

  return (
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-950 text-white rounded-2xl w-full h-full min-h-[420px] select-none overflow-hidden border border-sky-500/30">
      <div className="flex items-center justify-between w-full max-w-[640px] mb-2 z-10 px-1">
        <span className="text-xs text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-base">🎨</span> Paper.io 2 HTML5
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-sky-300 font-extrabold bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">
            Land: {playerCoverage}%
          </span>
          <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Best: {highScore}%
          </span>
          <button
            onClick={initGame}
            className="p-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-all font-bold shadow-md hover:scale-105"
            title="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-[640px] aspect-[640/480] rounded-2xl overflow-hidden shadow-2xl border-2 border-sky-500/40 bg-slate-950">
        <canvas ref={canvasRef} width={640} height={480} className="w-full h-full block" />

        {gameState === 'playing' && leaderboard.length > 0 && (
          <div className="absolute top-3 right-3 bg-slate-950/80 border border-sky-500/30 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-[11px] space-y-1 w-36 pointer-events-none">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 mb-1 border-b border-sky-500/20 pb-1">
              Leaderboard
            </div>
            {leaderboard.map((item, i) => (
              <div key={i} className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 truncate" style={{ color: item.color }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="text-white font-mono text-[10px]">{item.pct}%</span>
              </div>
            ))}
          </div>
        )}

        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4 z-10 animate-fade-in">
            <div className="text-5xl animate-bounce">🎨</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 drop-shadow-md">
              Paper.io 2
            </h2>
            <p className="text-xs text-sky-200/90 font-medium max-w-xs leading-relaxed">
              Claim territory by drawing closed loops! Bite opponent trails to defeat them, but protect your own trail.
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Play Paper.io 2
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4 z-10 animate-fade-in">
            <p className="text-red-400 font-black text-3xl tracking-wide drop-shadow-lg">ELIMINATED!</p>
            <div className="bg-slate-900/90 border border-sky-500/30 px-8 py-4 rounded-2xl space-y-1.5 shadow-inner w-60">
              <p className="text-xs text-sky-300 font-semibold uppercase">Territory Claimed: <span className="text-white font-extrabold text-base">{playerCoverage}%</span></p>
              <p className="text-xs text-amber-400 font-semibold uppercase">High Score: <span className="text-white font-extrabold text-base">{highScore}%</span></p>
            </div>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full max-w-[640px] mt-2 text-[11px] text-sky-300/80 px-1">
        <span>Controls: <kbd className="px-1 bg-slate-800 rounded border border-slate-700 font-mono">WASD</kbd> or <kbd className="px-1 bg-slate-800 rounded border border-slate-700 font-mono">Arrow Keys</kbd> to steer</span>
      </div>
    </div>
  );
};

export const BuiltInGamesEngine = ({ gameId }) => {
  if (gameId === 'chroma-incident' || gameId === 'color-puzzles') {
    return <ChromaIncidentEngine />;
  }
  if (gameId === '2048-frost') {
    return <Engine2048 />;
  }
  if (gameId === 'retro-snake') {
    return <EngineSnake />;
  }
  if (gameId === 'flappy-bird') {
    return <EngineFlappy />;
  }
  if (gameId === 'slope-game') {
    return <EngineSlope />;
  }

  return (
    <div className="p-8 text-center text-sky-300 flex flex-col items-center justify-center h-full">
      <p className="font-semibold text-sm">Web Embed Game</p>
      <p className="text-xs text-sky-400/80 mt-1">Switching to web embed player mode...</p>
    </div>
  );
};


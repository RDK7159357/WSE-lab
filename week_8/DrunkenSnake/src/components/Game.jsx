import { useState, useEffect, useRef } from 'react';

const GRID = 20, CELL = 20;
const DIR = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };
const INIT_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INIT_FOOD = { x: 5, y: 5 };

export default function Game() {
  const [state, setState] = useState({
    snake: INIT_SNAKE,
    food: INIT_FOOD,
    dir: 'UP',
    next: 'UP',
    over: false,
    score: 0,
    speed: 150,
    paused: false
  });

  const ref = useRef(state);
  useEffect(() => { ref.current = state; }, [state]);

  const genFood = (snake) => {
    let f;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some(p => p.x === f.x && p.y === f.y));
    return f;
  };

  useEffect(() => {
    const onKey = (e) => {
      // Use ref.current instead of state to get latest values
      if (ref.current.over) return;
      if (e.key === ' ') return setState(s => ({ ...s, paused: !s.paused }));
      
      const move = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' }[e.key];
      if (move) {
        // Check against current direction using ref
        const currentDir = ref.current.dir;
        const isOpposite = 
          DIR[move][0] + DIR[currentDir][0] === 0 && 
          DIR[move][1] + DIR[currentDir][1] === 0;
        
        if (!isOpposite) {
          setState(s => ({ ...s, next: move }));
        }
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // Empty dependency array - handler uses ref.current

  useEffect(() => {
    if (state.over || state.paused) return;
    const interval = setInterval(() => {
      setState(s => {
        let moveDir = s.next;
        if (Math.random() < 0.25) {
          const options = Object.keys(DIR).filter(k => 
            !(DIR[k][0] + DIR[s.dir][0] === 0 && DIR[k][1] + DIR[s.dir][1] === 0)
          );
          moveDir = options[Math.floor(Math.random() * options.length)];
        }

        const head = { 
          x: s.snake[0].x + DIR[moveDir][0], 
          y: s.snake[0].y + DIR[moveDir][1] 
        };
        
        // Collision detection
        const collision = 
          head.x < 0 || head.x >= GRID ||
          head.y < 0 || head.y >= GRID ||
          s.snake.some((p, index) => index !== 0 && p.x === head.x && p.y === head.y);
        
        if (collision) return { ...s, over: true };

        const newSnake = [head, ...s.snake];
        const ate = head.x === s.food.x && head.y === s.food.y;

        return {
          ...s,
          snake: ate ? newSnake : newSnake.slice(0, -1),
          food: ate ? genFood(newSnake) : s.food,
          score: ate ? s.score + 10 : s.score,
          dir: moveDir,
          next: moveDir,
          speed: ate ? Math.max(s.speed * 0.95, 70) : s.speed
        };
      });
    }, state.speed);
    return () => clearInterval(interval);
  }, [state.over, state.paused, state.speed]);

  // Rest of the component remains the same
  const reset = () => setState({ ...state, snake: INIT_SNAKE, food: INIT_FOOD, dir: 'UP', next: 'UP', over: false, score: 0, speed: 150, paused: false });

  return (
    <div style={{ background: '#1a1a1a', color: '#eee', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Drunken Snake</h1>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 15 }}>Score: {state.score}</span>
        <button onClick={() => setState(s => ({ ...s, paused: !s.paused }))} 
                style={{ background: '#2196f3', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
          {state.paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div style={{ position: 'relative', width: GRID * CELL, height: GRID * CELL, background: '#222', border: '2px solid #333' }}>
        {state.snake.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: CELL - 2,
              height: CELL - 2,
              left: p.x * CELL + 1,
              top: p.y * CELL + 1,
              background: i === 0 ? '#4caf50' : '#388e3c',
              borderRadius: 3
            }}
          />
        ))}
        <div style={{ 
          position: 'absolute', 
          width: CELL - 4, 
          height: CELL - 4, 
          left: state.food.x * CELL + 2, 
          top: state.food.y * CELL + 2, 
          background: '#f44336', 
          borderRadius: '50%' 
        }} />
        {state.over && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(0,0,0,0.7)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Game Over!</h2>
            <p style={{ marginBottom: 10 }}>Final Score: {state.score}</p>
            <button onClick={reset} 
                    style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
              Play Again
            </button>
          </div>
        )}
      </div>
      <p style={{ marginTop: 20, fontSize: 12, textAlign: 'center' }}>
        Arrow keys to move | Space to pause
        <br />
        <span style={{ color: '#ffeb3b' }}>This snake is drunk!</span>
      </p>
    </div>
  );
}
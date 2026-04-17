import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 120;

type Point = { x: number; y: number };

export function useSnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const directionQueueRef = useRef<Point[]>([{ x: 0, y: -1 }]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const startPoint = { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) };
    setSnake([startPoint]);
    directionQueueRef.current = [{ x: 0, y: -1 }];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(generateFood([startPoint]));
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === ' ') {
        setIsPaused(p => !p);
        return;
      }

      if (gameOver || isPaused) return;
      
      const latestDir = directionQueueRef.current[directionQueueRef.current.length - 1];
      let newDir: Point | null = null;
      
      const key = e.key.toLowerCase();
      
      if (['arrowup', 'w'].includes(key) && latestDir.y !== 1) newDir = { x: 0, y: -1 };
      else if (['arrowdown', 's'].includes(key) && latestDir.y !== -1) newDir = { x: 0, y: 1 };
      else if (['arrowleft', 'a'].includes(key) && latestDir.x !== 1) newDir = { x: -1, y: 0 };
      else if (['arrowright', 'd'].includes(key) && latestDir.x !== -1) newDir = { x: 1, y: 0 };

      if (newDir && (newDir.x !== latestDir.x || newDir.y !== latestDir.y)) {
        directionQueueRef.current.push(newDir);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        let currentDir = directionQueueRef.current[0];
        if (directionQueueRef.current.length > 1) {
          currentDir = directionQueueRef.current.shift()!;
        }

        const head = prevSnake[0];
        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        // Check bounds
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 5);
    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [gameOver, isPaused, food, score, generateFood]);

  return { snake, food, gameOver, score, isPaused, resetGame, GRID_SIZE };
}

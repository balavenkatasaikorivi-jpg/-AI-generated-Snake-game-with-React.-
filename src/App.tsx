import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSnakeGame } from './hooks/useSnakeGame';

const TRACKS = [
  { id: 1, title: "DATA_STREAM_01", artist: "UNKNOWN_ORIGIN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "NULL_POINTER_EXCEPTION", artist: "SYS_ADMIN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "KERNEL_PANIC", artist: "DAEMON", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const Equalizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex space-x-1 items-end h-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          className="w-2 bg-[#ff00ff]"
          animate={{
            height: isPlaying ? ['20%', '100%', '10%', '80%', '40%'] : '10%',
            opacity: isPlaying ? 1 : 0.4
          }}
          transition={{
            duration: Math.random() * 0.2 + 0.1,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);

  const { snake, food, gameOver, score, isPaused, resetGame, GRID_SIZE } = useSnakeGame();

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && isPlayingMusic) audioRef.current.play();
  }, [currentTrackIndex, isPlayingMusic]);

  useEffect(() => {
     const audio = audioRef.current;
     if (!audio) return;
     const handleEnded = () => nextTrack();
     audio.addEventListener('ended', handleEnded);
     return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-terminal flex flex-col pt-8 pb-12 px-4 sm:px-8 items-center selection:bg-[#ff00ff] selection:text-white overflow-hidden relative uppercase">
      <div className="static-noise-overlay" />
      <div className="scanlines" />

      <header className="mb-4 text-center z-10 w-full max-w-6xl border-b-4 border-[#00ffff] pb-8 pt-4 border-double">
         <h1 
           className="text-4xl md:text-6xl font-pixel tracking-tighter text-white glitch"
           data-text="SYS.BREACH_v1.0"
         >
           SYS.BREACH_v1.0
         </h1>
      </header>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10 relative mt-4">
         
         {/* GAME PANEL */}
         <div className="lg:col-span-8 flex flex-col items-center w-full">
            <div className="w-full border-2 border-[#00ffff] bg-black p-1 relative shadow-[0_0_15px_rgba(0,255,255,0.4)] block">
              {/* Box corners */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#ff00ff]"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#ff00ff]"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#ff00ff]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#ff00ff]"></div>

              <div className="relative border-2 border-[#ff00ff] overflow-hidden w-full aspect-square filter p-1 bg-black">
                <div 
                  className="w-full h-full grid gap-0 relative" 
                  style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, 
                    gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))` 
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    const isHead = snake[0].x === x && snake[0].y === y;
                    const isSnake = !isHead && snake.some(s => s.x === x && s.y === y);
                    const isFood = food.x === x && food.y === y;
                    
                    let cellClass = "w-full h-full border border-black";
                    if (isHead) cellClass = "w-full h-full bg-white border-2 border-[#ff00ff] z-10 scale-110";
                    else if (isSnake) cellClass = "w-full h-full bg-[#00ffff] border border-black";
                    else if (isFood) cellClass = "w-full h-full bg-[#ff00ff] animate-pulse border border-black";
                    else cellClass = "w-full h-full bg-black border-[0.5px] border-[#00ffff]/10";

                    return <div key={i} className={cellClass} />
                  })}
                </div>
                
                <AnimatePresence>
                  {gameOver && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-[#ff00ff]"
                    >
                      <h2 
                        className="text-4xl md:text-5xl text-white font-pixel mb-6 glitch"
                        data-text="FATAL_ERROR"
                      >
                        FATAL_ERROR
                      </h2>
                      <p className="text-2xl text-[#00ffff] font-terminal mb-8 tracking-widest leading-none">DATA_LOST: {score}</p>
                      <button 
                        onClick={resetGame}
                        className="px-6 py-3 bg-[#00ffff] text-black font-pixel hover:bg-[#ff00ff] hover:text-white transition-none text-sm border-2 border-transparent hover:border-white shadow-[0_0_10px_rgba(0,255,255,0.8)] leading-none"
                      >
                        [ REBOOT_SEQUENCE ]
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="mt-6 w-full flex flex-row items-center justify-between text-xl md:text-2xl text-[#ff00ff] font-terminal tracking-wider">
               <div className="bg-[#00ffff] text-black px-4 py-1 font-bold">INPUT_HW: [W A S D]</div>
               <div className="border border-[#ff00ff] px-4 py-1 animate-pulse hidden sm:block">INTERRUPT: [SPACE]</div>
            </div>
         </div>

         {/* AUDIO & SCORE PANEL */}
         <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* SCORE DISPLAY */}
            <div className="border-2 border-[#ff00ff] bg-black p-5 flex flex-col shadow-[inset_0_0_20px_rgba(255,0,255,0.2)] relative min-w-0">
               <div className="absolute -top-3 left-4 bg-black px-2 text-[#00ffff] font-pixel text-[10px] leading-none whitespace-nowrap">
                 METRICS_LOG
               </div>
               <h3 className="text-[#00ffff] font-terminal text-lg sm:text-2xl border-b border-[#00ffff]/50 pb-2 flex justify-between tracking-widest mb-4">
                 <span>MEM_ALLOCATED</span>
                 <span className={isPaused && !gameOver ? "text-[#ff00ff] animate-pulse" : "text-[#00ffff]"}>
                    {isPaused && !gameOver ? "[ INTERRUPT ]" : "[ ACTIVE ]"}
                 </span>
               </h3>
               <div className="text-4xl sm:text-5xl md:text-6xl font-pixel text-[#00ffff] text-right glitch drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" data-text={score.toString().padStart(5, '0')}>
                 {score.toString().padStart(5, '0')}
               </div>
            </div>

            {/* AUDIO CONSOLE */}
            <div className="border-2 border-[#00ffff] bg-black p-5 relative shadow-[inset_0_0_20px_rgba(0,255,255,0.2)] min-w-0">
               <div className="absolute -top-3 right-4 bg-black px-2 text-[#ff00ff] font-pixel text-[10px] leading-none whitespace-nowrap">
                 [AUDIO_SYS_MGR]
               </div>
               
               <div className="flex justify-between items-end mb-4 font-terminal text-2xl text-[#ff00ff]">
                  <span className="tracking-widest flex items-center">
                    {isPlayingMusic ? <span className="tearing inline-block mr-2 text-white">▓</span> : <span className="inline-block mr-2 text-[#ff00ff]">░</span>} 
                    STREAM_IO
                  </span>
                  <Equalizer isPlaying={isPlayingMusic} />
               </div>
               
               <div className="border-2 border-[#ff00ff] p-4 mb-6 bg-black text-[#00ffff] uppercase font-pixel text-[10px] sm:text-xs min-h-[100px] relative overflow-hidden group hover:bg-[#ff00ff]/10 transition-colors">
                  {isPlayingMusic ? (
                    <div className="tearing mb-3 opacity-90 text-white">&gt; READING_SECTORS...</div>
                  ) : (
                    <div className="mb-3 opacity-50">&gt; STREAM_HALTED...</div>
                  )}
                  <div className="text-[#ff00ff] text-base md:text-lg leading-tight mb-2 truncate">
                    {TRACKS[currentTrackIndex].title}
                  </div>
                  <div className="opacity-70 truncate block text-[10px]">
                    SRC: {TRACKS[currentTrackIndex].artist}
                  </div>
               </div>
               
               <div className="flex justify-between items-center bg-[#00ffff] p-1 gap-1 h-14">
                  <button 
                    onClick={prevTrack} 
                    className="bg-black text-[#00ffff] hover:bg-[#ff00ff] hover:text-black flex-1 h-full font-pixel text-sm border border-[#00ffff] transition-none"
                  >
                    {'<<'}
                  </button>
                  <button 
                    onClick={toggleMusic} 
                    className="bg-black text-[#ff00ff] hover:bg-white hover:text-black flex-1 h-full font-pixel text-lg border border-[#ff00ff] transition-none tracking-widest pt-1"
                  >
                    {isPlayingMusic ? 'HLT' : 'RUN'}
                  </button>
                  <button 
                    onClick={nextTrack} 
                    className="bg-black text-[#00ffff] hover:bg-[#ff00ff] hover:text-black flex-1 h-full font-pixel text-sm border border-[#00ffff] transition-none"
                  >
                    {'>>'}
                  </button>
               </div>

               <div className="mt-6 border-t-2 border-[#00ffff]/50 pt-5 flex gap-4 items-center font-pixel text-[10px] text-[#00ffff]">
                 <span className="mt-0.5">[AMP]</span>
                 <input 
                   type="range" 
                   min="0" max="1" step="0.05"
                   value={volume}
                   onChange={(e) => setVolume(parseFloat(e.target.value))}
                   className="w-full appearance-none h-4 bg-black border-2 border-[#00ffff] cursor-crosshair
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#ff00ff] [&::-webkit-slider-thumb]:hover:bg-white
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#ff00ff] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:hover:bg-white
                   [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:transition-colors"
                 />
               </div>
               
               <audio ref={audioRef} src={TRACKS[currentTrackIndex].url} loop={false} />
            </div>

            <div className="text-center text-[#ff00ff] text-lg font-terminal border-2 border-[#ff00ff] p-3 bg-black animate-pulse opacity-90 tracking-widest shadow-[0_0_15px_rgba(255,0,255,0.5)] flex items-center justify-center">
              WARNING: SYS_ANOMALY DETECTED.
            </div>

         </div>
      </div>
    </div>
  );
}

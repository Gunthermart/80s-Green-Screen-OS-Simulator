import React, { useRef, useState, MouseEvent, WheelEvent, useEffect } from 'react';
import { Point } from '../types';
import GuessMarker from './icons/GuessMarker';
import HistoryMarker from './icons/HistoryMarker';

// Clamping utility
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const MIN_SCALE = 1;
const MAX_SCALE = 8;

interface MapProps {
  onGuess: (point: Point) => void;
  guess: Point | null;
  guessHistory: Point[];
  isGuessingDisabled: boolean;
}

const Map: React.FC<MapProps> = ({ onGuess, guess, guessHistory, isGuessingDisabled }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panState = useRef({ isPanning: false, startX: 0, startY: 0, lastX: 0, lastY: 0, didPan: false });
  
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [guessPosition, setGuessPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (guess === null) {
      setGuessPosition(null);
      // Reset zoom/pan on new round for a consistent experience
      setTransform({ scale: 1, x: 0, y: 0 });
    }
  }, [guess]);

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!panState.current.isPanning) return;

    const dx = e.clientX - panState.current.startX;
    const dy = e.clientY - panState.current.startY;
    
    if (!panState.current.didPan && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      panState.current.didPan = true;
    }

    const newX = panState.current.lastX + dx;
    const newY = panState.current.lastY + dy;

    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };
  
  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    panState.current.isPanning = false;
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isGuessingDisabled) return;
    e.preventDefault();
    panState.current = {
      isPanning: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: transform.x,
      lastY: transform.y,
      didPan: false,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isGuessingDisabled || panState.current.didPan || !mapContainerRef.current) return;
    
    const rect = mapContainerRef.current.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const imageX = (clickX - transform.x) / transform.scale;
    const imageY = (clickY - transform.y) / transform.scale;
    
    const imageWidth = rect.width;
    const imageHeight = rect.height;

    if (imageX < 0 || imageX > imageWidth || imageY < 0 || imageY > imageHeight) {
      return;
    }

    const lat = 90 - (imageY / rect.height) * 180;
    const lng = (imageX / rect.width) * 360 - 180;

    setGuessPosition({ x: imageX, y: imageY });
    onGuess({ lat, lng });
  };
  
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isGuessingDisabled) return;
    e.preventDefault();
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const scaleAmount = -e.deltaY * 0.005;
    const newScale = clamp(transform.scale + scaleAmount, MIN_SCALE, MAX_SCALE);
    
    if (newScale === transform.scale) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const mapX = (mouseX - transform.x) / transform.scale;
    const mapY = (mouseY - transform.y) / transform.scale;

    const newX = mouseX - mapX * newScale;
    const newY = mouseY - mapY * newScale;
    
    setTransform({ scale: newScale, x: newX, y: newY });
  };

  const zoom = (direction: number) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const scaleAmount = direction * 0.4;
    const newScale = clamp(transform.scale + scaleAmount, MIN_SCALE, MAX_SCALE);

    if (newScale === transform.scale) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mapX = (centerX - transform.x) / transform.scale;
    const mapY = (centerY - transform.y) / transform.scale;

    const newX = centerX - mapX * newScale;
    const newY = centerY - mapY * newScale;

    setTransform({ scale: newScale, x: newX, y: newY });
  }

  return (
    <div 
      className="flex-grow w-full relative select-none bg-gray-700 rounded-md overflow-hidden touch-none" 
      ref={mapContainerRef} 
      onMouseDown={handleMouseDown}
      onClick={handleMapClick}
      onWheel={handleWheel}
      style={{ cursor: isGuessingDisabled ? 'not-allowed' : (panState.current.isPanning ? 'grabbing' : 'grab') }}
    >
      <div 
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'top left',
          width: '100%',
          height: '100%',
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
          alt="World Map"
          className="w-full h-full object-contain pointer-events-none"
        />
        {guessPosition && (
          <div
            className="absolute pointer-events-none"
            style={{ 
              left: `${guessPosition.x}px`, 
              top: `${guessPosition.y}px`,
              transform: `translate(-50%, -50%) scale(${1 / transform.scale})`,
              transformOrigin: 'center center'
            }}
          >
            <GuessMarker className="w-6 h-6 text-red-500 drop-shadow-lg" />
          </div>
        )}
        {mapContainerRef.current && guessHistory.map((histGuess, index) => {
          const { width, height } = mapContainerRef.current!.getBoundingClientRect();
          const x = ((histGuess.lng + 180) / 360) * width;
          const y = ((-histGuess.lat + 90) / 180) * height;

          return (
            <div
              key={`hist-${index}`}
              className="absolute pointer-events-none"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(-50%, -50%) scale(${1 / transform.scale})`,
                transformOrigin: 'center center',
              }}
            >
              <HistoryMarker className="w-4 h-4 text-blue-400 opacity-75" />
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button 
            onClick={() => zoom(1)} 
            className="w-10 h-10 bg-gray-800/80 text-white rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-700 transition-colors shadow-lg focus:outline-none"
            aria-label="Zoom in"
          >
              +
          </button>
          <button 
            onClick={() => zoom(-1)} 
            className="w-10 h-10 bg-gray-800/80 text-white rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-700 transition-colors shadow-lg focus:outline-none"
            aria-label="Zoom out"
          >
              -
          </button>
      </div>
    </div>
  );
};

export default Map;
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 8;
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/serial';

// Type definitions
type GridData = number[][];
type LetterPattern = number[][];
type LetterPatterns = { [key: string]: LetterPattern };
type NumberToLetter = { [key: string]: string };

// 8x8 pixel patterns for capital letters A-G
const LETTER_PATTERNS: LetterPatterns = {
  A: [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,0]
  ],
  B: [
    [0,1,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  C: [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  D: [
    [0,1,1,1,1,0,0,0],
    [0,1,0,0,0,1,0,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,1,0,0],
    [0,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  E: [
    [0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0]
  ],
  F: [
    [0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  G: [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,1,1,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0]
  ]
};

// Number to letter mapping
const NUMBER_TO_LETTER: NumberToLetter = {
  '1': 'A',
  '2': 'B',
  '3': 'C',
  '4': 'D',
  '5': 'E',
  '6': 'F',
  '7': 'G'
};

// Helper function to create empty grid
const createEmptyGrid = (): GridData => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

export default function App() {
  const [gridData, setGridData] = useState<GridData>(createEmptyGrid());
  const [currentLetter, setCurrentLetter] = useState<string>('');
  const websocket = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<string>('Connecting...');

  // WebSocket Connection
  useEffect(() => {
    console.log(`Attempting to connect to WebSocket: ${WEBSOCKET_URL}`);
    const ws = new WebSocket(WEBSOCKET_URL);
    websocket.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established.');
      setWsStatus('Connected');
    };

    ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed.', event);
      setWsStatus(`Disconnected (Code: ${event.code}, Reason: ${event.reason || 'N/A'})`);
    };

    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setWsStatus('Error');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log('Closing WebSocket connection.');
        ws.close();
      }
    };
  }, []);

  // Send data via WebSocket
  const sendDataViaWebSocket = useCallback((data: GridData, numberPressed?: string) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      let dataString: string;

      if (numberPressed) {
        dataString = data.map(row => row.join('') + numberPressed).join('\n');
      } else {
        dataString = data.map(row => row.join('') + "8").join('\n');
      }

      try {
        websocket.current.send(dataString);
        console.log('Grid data sent via WebSocket:', dataString);
      } catch (error) {
        console.error('Error sending data via WebSocket:', error);
        setWsStatus('Error sending data');
      }
    } else {
      console.warn('WebSocket not open. Cannot send data.');
      if (websocket.current && websocket.current.readyState !== WebSocket.CONNECTING) {
        setWsStatus('Disconnected - Cannot send');
      }
    }
  }, []);

  // Handle keyboard input
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const key = e.key;

    if (NUMBER_TO_LETTER[key]) {
      const letter = NUMBER_TO_LETTER[key];
      const pattern = LETTER_PATTERNS[letter];

      setCurrentLetter(letter);
      setGridData(pattern);
      sendDataViaWebSocket(pattern, key);
    }

    if (key === ' ' || key === 'Escape') {
      const emptyGrid = createEmptyGrid();
      setCurrentLetter('');
      setGridData(emptyGrid);
      sendDataViaWebSocket(emptyGrid);
    }
  }, [sendDataViaWebSocket]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Handle button clicks with vibration feedback
  const handleLetterClick = (letter: string, number: string) => {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const pattern = LETTER_PATTERNS[letter];
    setCurrentLetter(letter);
    setGridData(pattern);
    sendDataViaWebSocket(pattern, number);
  };

  const handleClear = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const emptyGrid = createEmptyGrid();
    setCurrentLetter('');
    setGridData(emptyGrid);
    sendDataViaWebSocket(emptyGrid);
  };

  const getStatusColor = (): string => {
    if (wsStatus === 'Connected') return 'text-green-600';
    if (wsStatus.startsWith('Disconnected') || wsStatus === 'Error' || wsStatus.startsWith('Error sending')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gray-800 shadow-lg p-4">
        <h1 className="text-2xl font-bold text-center">Note Controller</h1>
        <div className={`text-center text-sm mt-2 font-medium ${getStatusColor()}`}>
          {wsStatus}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {/* Current Letter Display */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-4 text-center shadow-lg">
          <p className="text-sm text-gray-400 uppercase tracking-wider">Active Note</p>
          <p className="text-6xl font-bold mt-2 text-blue-400">
            {currentLetter || '—'}
          </p>
        </div>

        {/* Grid Display */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="max-w-xs mx-auto">
            <div className="grid grid-cols-8 gap-0.5 bg-gray-700 p-1 rounded-lg">
              {gridData.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square rounded-sm transition-all duration-200
                              ${cell === 1 
                                ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                                : 'bg-gray-900'}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Note Buttons - Mobile Optimized */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {Object.entries(NUMBER_TO_LETTER).map(([num, letter]) => (
              <button
                key={num}
                onClick={() => handleLetterClick(letter, num)}
                className="relative bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                         text-white rounded-2xl shadow-lg active:shadow-inner
                         transition-all duration-150 h-20 touch-manipulation
                         transform active:scale-95"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-3xl font-bold">{letter}</span>
                  <span className="text-xs text-blue-200 absolute top-2 right-2">{num}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="w-full h-16 bg-red-600 hover:bg-red-700 active:bg-red-800
                     text-white font-bold rounded-2xl shadow-lg active:shadow-inner
                     transition-all duration-150 text-lg touch-manipulation
                     transform active:scale-95 mb-4"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 p-3 text-center text-xs text-gray-400">
        <p>Press numbers 1-7 or tap notes • Space/Esc to clear</p>
      </div>
    </div>
  );
}
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Tailwind CSS is assumed to be available in a Next.js project.
// If not, ensure it's set up.

const GRID_SIZE = 8;
const WEBSOCKET_URL = 'ws://0.0.0.0:4000/serial'; // WebSocket server URL

// Helper function to initialize the grid
const createInitialGrid = (): number[][] => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

// Main App Component
export default function App() {
  const [gridData, setGridData] = useState<number[][]>(createInitialGrid);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [drawMode, setDrawMode] = useState<'draw' | 'erase' | 'toggle'>('draw');
  const isInitialMount = useRef<boolean>(true);
  const websocket = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<string>('Connecting...');

  // --- WebSocket Connection Effect ---
  useEffect(() => {
    console.log(`Attempting to connect to WebSocket: ${WEBSOCKET_URL}`);
    websocket.current = new WebSocket(WEBSOCKET_URL);

    websocket.current.onopen = () => {
      console.log('WebSocket connection established.');
      setWsStatus('Connected');
    };

    websocket.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed.', event);
      setWsStatus(`Disconnected (Code: ${event.code}, Reason: ${event.reason || 'N/A'})`);
    };

    websocket.current.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setWsStatus('Error');
    };

    // Optional: Handle incoming messages if your server sends any
    // websocket.current.onmessage = (event) => {
    //   console.log('WebSocket message received:', event.data);
    // };

    // Cleanup function to close WebSocket on component unmount
    return () => {
      if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection.');
        websocket.current.close();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Send Data via WebSocket Effect ---
  const sendDataViaWebSocket = useCallback(() => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      const dataString = gridData.map(row => row.join('')).join('\n');
      try {
        websocket.current.send(dataString);
        console.log('Grid data sent via WebSocket:', dataString);
      } catch (error) {
        console.error('Error sending data via WebSocket:', error);
        setWsStatus('Error sending data');
      }
    } else {
      console.warn('WebSocket not open. Cannot send data.');
      // Optionally update status or queue data if connection is temporarily down
      if (websocket.current && websocket.current.readyState !== WebSocket.CONNECTING) {
        setWsStatus('Disconnected - Cannot send');
      }
    }
  }, [gridData]); // Depends on gridData

  useEffect(() => {
    // Prevent sending data on the initial render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    sendDataViaWebSocket();
  }, [gridData, sendDataViaWebSocket]); // Re-run when gridData or the send function changes


  // --- Grid Interaction Handlers ---
  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    setIsMouseDown(true);
    const newGrid = gridData.map(row => [...row]);
    if (drawMode === 'draw') {
      newGrid[rowIndex][colIndex] = 1;
    } else if (drawMode === 'erase') {
      newGrid[rowIndex][colIndex] = 0;
    } else { // Toggle mode
        newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === 0 ? 1 : 0;
    }
    setGridData(newGrid);
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isMouseDown) {
      const newGrid = gridData.map(row => [...row]);
      if (drawMode === 'draw') {
        newGrid[rowIndex][colIndex] = 1;
      } else if (drawMode === 'erase') {
        newGrid[rowIndex][colIndex] = 0;
      }
      else if (drawMode === 'toggle') {
        newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === 0 ? 1 : 0;
      }
      setGridData(newGrid);
    }
  };

  const handleMouseUpGlobal = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [handleMouseUpGlobal]);

  // --- Control Button Handlers ---
  const handleClearGrid = () => {
    setGridData(createInitialGrid());
    // Data will be sent automatically by the useEffect watching gridData
  };

  // --- UI Rendering ---
  const getStatusColor = (): string => {
    if (wsStatus === 'Connected') return 'text-green-500';
    if (wsStatus.startsWith('Disconnected') || wsStatus === 'Error' || wsStatus.startsWith('Error sending')) return 'text-red-500';
    return 'text-yellow-500'; // Connecting or other states
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-700 mb-2">Pixel Drawer (8x8)</h1>

        <div className={`mb-4 text-sm text-center font-semibold ${getStatusColor()}`}>
          WebSocket: {wsStatus}
        </div>

        {/* Drawing Mode Switcher */}
        <div className="mb-6 flex justify-center space-x-2">
          <button
            onClick={() => setDrawMode('draw')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ease-in-out
                        ${drawMode === 'draw' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Draw
          </button>
          <button
            onClick={() => setDrawMode('erase')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ease-in-out
                        ${drawMode === 'erase' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Erase
          </button>
           <button
            onClick={() => setDrawMode('toggle')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ease-in-out
                        ${drawMode === 'toggle' ? 'bg-yellow-500 text-black shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Toggle
          </button>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-8 gap-0.5 border border-gray-400 bg-gray-400 rounded-md overflow-hidden shadow-md"
          onMouseLeave={handleMouseUpGlobal}
          onDragStart={(e) => e.preventDefault()}
        >
          {gridData.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-full aspect-square cursor-pointer transition-colors duration-50
                            ${cell === 1 ? 'bg-gray-800' : 'bg-white hover:bg-gray-200'}`}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              />
            ))
          )}
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center">
          <button
            onClick={handleClearGrid}
            className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75"
          >
            Clear Grid
          </button>
          {/* Manual send button could be added here if needed */}
          {/* <button
            onClick={sendDataViaWebSocket}
            disabled={!(websocket.current && websocket.current.readyState === WebSocket.OPEN)}
            className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-150 ease-in-out shadow-md disabled:opacity-50"
          >
            Send Manually
          </button> */}
        </div>
         <p className="text-xs text-gray-500 mt-6 text-center">
          Grid data is sent automatically via WebSocket on changes.
          Click & drag to {drawMode}. Mouse down on a cell to {drawMode === 'toggle' ? 'toggle it' : `set it to ${drawMode === 'draw' ? 'ON' : 'OFF'}`}.
        </p>
      </div>
    </div>
  );
}

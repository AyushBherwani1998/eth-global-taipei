import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface GameState {
  grid: string[][];
  roomId: string;
  playerId: string;
  playerName: string;
  playerStrategy: string;
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    grid: Array(6).fill(null).map(() => Array(6).fill('.')),
    roomId: 'game-room',
    playerId: `player-${Date.now()}`,
    playerName: '',
    playerStrategy: ''
  });
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize connection
  useEffect(() => {
    if (!url) return;
    
    // Create WebSocket connection
    socketRef.current = new WebSocket(url);
    
    // Connection opened
    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };
    
    // Listen for messages
    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        
        // Update game state based on message type
        if (message.type === 'update' || message.type === 'end') {
          setGameState(prevState => ({
            ...prevState,
            grid: message.grid
          }));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };
    
    // Handle errors
    socketRef.current.onerror = (e) => {
      console.error('WebSocket error:', e);
      setError(new Error('WebSocket connection error'));
    };
    
    // Connection closed
    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setIsConnected(false);
    };
    
    // Cleanup on component unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [url]);

  // Join a game room
  const joinRoom = useCallback((roomId: string, name: string, strategy: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError(new Error('WebSocket is not connected'));
      return;
    }
    
    const playerData = {
      type: 'join',
      roomId,
      playerId: gameState.playerId,
      name,
      strategy
    };
    
    socketRef.current.send(JSON.stringify(playerData));
    
    setGameState(prevState => ({
      ...prevState,
      roomId,
      playerName: name,
      playerStrategy: strategy
    }));
  }, [gameState.playerId]);

  // Send a message to the WebSocket server
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError(new Error('WebSocket is not connected'));
      return;
    }
    
    socketRef.current.send(JSON.stringify(message));
  }, []);

  return {
    isConnected,
    gameState,
    lastMessage,
    error,
    joinRoom,
    sendMessage
  };
} 
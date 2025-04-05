import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface GameBoardProps {
  websocketUrl: string;
}

export default function GameBoard({ websocketUrl }: GameBoardProps) {
  const [playerName, setPlayerName] = useState('');
  const [playerStrategy, setPlayerStrategy] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { isConnected, gameState, lastMessage, error, joinRoom, sendMessage } = useWebSocket(websocketUrl);

  // Handle game joining
  const handleJoinGame = () => {
    if (!playerName) {
      alert('Please enter your name');
      return;
    }
    
    if (!playerStrategy) {
      alert('Please select a strategy');
      return;
    }
    
    joinRoom('game-room', playerName, playerStrategy);
    setIsJoined(true);
  };

  // Render game grid
  const renderGrid = () => {
    return (
      <div className="grid-container">
        <h2>Game Grid</h2>
        <div className="grid">
          {gameState.grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid-row">
              {row.map((cell, cellIndex) => (
                <div key={`cell-${rowIndex}-${cellIndex}`} className="grid-cell">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle game status messages
  useEffect(() => {
    if (lastMessage?.type === 'end') {
      alert(`Game Over! Winner: ${lastMessage.winner}`);
    }
  }, [lastMessage]);

  return (
    <div className="game-board">
      {error && <div className="error">Error: {error.message}</div>}
      
      {!isConnected ? (
        <div className="connecting">Connecting to game server...</div>
      ) : !isJoined ? (
        <div className="join-form">
          <h2>Join Game</h2>
          <div className="form-group">
            <label htmlFor="player-name">Your Name:</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="player-strategy">Choose Strategy:</label>
            <select
              id="player-strategy"
              value={playerStrategy}
              onChange={(e) => setPlayerStrategy(e.target.value)}
            >
              <option value="">Select strategy</option>
              <option value="Aggressive">Aggressive</option>
              <option value="Diplomatic">Diplomatic</option>
              <option value="Opportunistic">Opportunistic</option>
            </select>
          </div>
          
          <button onClick={handleJoinGame}>Join Game</button>
        </div>
      ) : (
        <div className="game-content">
          <div className="game-info">
            <p>Player: {gameState.playerName}</p>
            <p>Strategy: {gameState.playerStrategy}</p>
            <p>Room: {gameState.roomId}</p>
          </div>
          {renderGrid()}
        </div>
      )}
    </div>
  );
} 
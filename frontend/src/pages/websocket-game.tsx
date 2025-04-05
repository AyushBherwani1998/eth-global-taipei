import { useState } from 'react';
import GameBoard from '../components/GameBoard';

export default function WebSocketGamePage() {
  const [websocketUrl, setWebsocketUrl] = useState('ws://localhost:4000');
  const [showGame, setShowGame] = useState(false);

  const handleConnect = () => {
    if (!websocketUrl) {
      alert('Please enter a valid WebSocket URL');
      return;
    }
    setShowGame(true);
  };

  return (
    <div className="container">
      <h1>WebSocket Game Demo</h1>
      
      {!showGame ? (
        <div className="connection-form">
          <div className="form-group">
            <label htmlFor="websocket-url">WebSocket Server URL:</label>
            <input
              id="websocket-url"
              type="text"
              value={websocketUrl}
              onChange={(e) => setWebsocketUrl(e.target.value)}
              placeholder="ws://localhost:4000"
            />
          </div>
          <button onClick={handleConnect}>Connect to Server</button>
        </div>
      ) : (
        <GameBoard websocketUrl={websocketUrl} />
      )}
      
      {showGame && (
        <button 
          className="back-button" 
          onClick={() => setShowGame(false)}
        >
          Disconnect & Go Back
        </button>
      )}
    </div>
  );
} 
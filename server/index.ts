// server/index.ts
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { OpenAI } from "openai";
import { config } from "dotenv";

config();
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(configuration);

type Hexagon = {
  q: number;
  r: number;
  owner: string | null;
  resources: number;
};

type Player = {
  id: string;
  name: string;
  personality: string;
  ws: WebSocket;
  territories: number;
  resources: number;
  allies: string[];
  enemies: string[];
  memory: string[];
};

type GameRoom = {
  id: string;
  players: Player[];
  started: boolean;
  grid: Hexagon[];
  turn: number;
};

const rooms: Record<string, GameRoom> = {};

function generateHexGrid(size: number): Hexagon[] {
  const grid: Hexagon[] = [];
  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      if (Math.abs(q + r) <= size) {
        grid.push({ 
          q, 
          r, 
          owner: null,
          resources: Math.floor(Math.random() * 3) // Random resources between 0-2
        });
      }
    }
  }
  return grid;
}

function getHexNeighbors(hex: Hexagon): { q: number; r: number }[] {
  const neighbors = [
    { q: hex.q + 1, r: hex.r },
    { q: hex.q + 1, r: hex.r - 1 },
    { q: hex.q, r: hex.r - 1 },
    { q: hex.q - 1, r: hex.r },
    { q: hex.q - 1, r: hex.r + 1 },
    { q: hex.q, r: hex.r + 1 },
  ];
  
  // Filter out neighbors that would be outside the map bounds
  return neighbors.filter(n => 
    Math.abs(n.q) <= 3 && 
    Math.abs(n.r) <= 3 && 
    Math.abs(n.q + n.r) <= 3
  );
}

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const msg = JSON.parse(message.toString());

    if (msg.type === "join") {
      let room = rooms[msg.roomId];
      if (!room) {
        room = {
          id: msg.roomId,
          players: [],
          started: false,
          grid: generateHexGrid(3), // 3 rings of hexagons
          turn: 0,
        };
        rooms[msg.roomId] = room;
      }

      if (room.players.length >= 4) {
        ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
        return;
      }

      const player: Player = {
        id: msg.playerId,
        name: msg.name,
        personality: msg.personality,
        ws: ws as any,
        territories: 0,
        resources: 0,
        allies: [],
        enemies: [],
        memory: [],
      };
      room.players.push(player);

      // Set starting positions for players
      const startPositions = [
        { q: -2, r: 0 }, // Player 1 starts at top-left
        { q: 2, r: 0 },  // Player 2 starts at top-right
        { q: 0, r: -2 }, // Player 3 starts at bottom-left
        { q: 0, r: 2 },  // Player 4 starts at bottom-right
      ];

      const pos = startPositions[room.players.length - 1];
      const hex = room.grid.find(h => h.q === pos.q && h.r === pos.r);
      if (hex) {
        hex.owner = msg.playerId;
        player.territories++;
        player.resources += hex.resources;
      }

      // Broadcast current state and waiting message
      const playersNeeded = 4 - room.players.length;
      broadcast(room, {
        message: playersNeeded > 0
          ? `Waiting for ${playersNeeded} more player${playersNeeded > 1 ? "s" : ""}...`
          : "All players joined! Starting game...",
      });

      // Start game only when 4 players have joined
      if (room.players.length === 4 && !room.started) {
        room.started = true;
        console.log(`\n=== GAME STARTING WITH 4 PLAYERS ===`);
        room.players.forEach((p, index) => {
          console.log(`${p.name} (${p.personality}) starting at position (${startPositions[index].q},${startPositions[index].r})`);
        });
        await new Promise((res) => setTimeout(res, 1000));
        runGameLoop(room);
      }
    } else if (msg.type === "action") {
      const room = Object.values(rooms).find(r => 
        r.players.some(p => p.id === msg.playerId)
      );
      
      if (!room) return;

      const currentPlayer = room.players[room.turn % room.players.length];
      if (currentPlayer.id !== msg.playerId) {
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "Not your turn" 
        }));
        return;
      }

      const hex = room.grid.find(h => 
        h.q === msg.hex.q && h.r === msg.hex.r
      );

      if (!hex) return;

      if (msg.action === "expand") {
        if (hex.owner) {
          ws.send(JSON.stringify({ 
            type: "error", 
            message: "Cannot expand to occupied territory" 
          }));
          return;
        }

        const playerHexes = room.grid.filter(h => h.owner === msg.playerId);
        const isAdjacent = playerHexes.some(h => 
          Math.abs(h.q - hex.q) <= 1 && Math.abs(h.r - hex.r) <= 1
        );

        if (!isAdjacent) {
          ws.send(JSON.stringify({ 
            type: "error", 
            message: "Can only expand to adjacent territories" 
          }));
          return;
        }

        hex.owner = msg.playerId;
        currentPlayer.territories++;
        currentPlayer.resources += hex.resources;
        broadcast(room, { message: `${currentPlayer.name} expanded their territory` });
      } else if (msg.action === "attack") {
        if (!hex.owner || hex.owner === msg.playerId) {
          ws.send(JSON.stringify({ 
            type: "error", 
            message: "Cannot attack this territory" 
          }));
          return;
        }

        const playerHexes = room.grid.filter(h => h.owner === msg.playerId);
        const isAdjacent = playerHexes.some(h => 
          Math.abs(h.q - hex.q) <= 1 && Math.abs(h.r - hex.r) <= 1
        );

        if (!isAdjacent) {
          ws.send(JSON.stringify({ 
            type: "error", 
            message: "Can only attack adjacent territories" 
          }));
          return;
        }

        // 50% chance of success
        if (Math.random() > 0.5) {
          const enemy = room.players.find(p => p.id === hex.owner);
          if (enemy) {
            // Remove territory from enemy's list
            enemy.territories--;
            enemy.resources -= hex.resources;
            
            // Add territory to attacker's list
            hex.owner = msg.playerId;
            currentPlayer.territories++;
            currentPlayer.resources += hex.resources;
            
            // Update relationships
            if (!currentPlayer.enemies.includes(enemy.id)) {
              currentPlayer.enemies.push(enemy.id);
              enemy.enemies.push(currentPlayer.id);
            }
            
            // Break any existing alliance
            const allyIndex = currentPlayer.allies.indexOf(enemy.id);
            if (allyIndex !== -1) {
              currentPlayer.allies.splice(allyIndex, 1);
              enemy.allies.splice(enemy.allies.indexOf(currentPlayer.id), 1);
            }
            
            // Update memory
            currentPlayer.memory.push(`Successfully attacked and captured (${hex.q}, ${hex.r}) from ${enemy.name}`);
            enemy.memory.push(`Lost territory at (${hex.q}, ${hex.r}) to ${currentPlayer.name}`);
            
            // Broadcast the territory change
            broadcast(room, {
              message: `${currentPlayer.name} captured territory from ${enemy.name} at (${hex.q}, ${hex.r})`,
              type: "update",
              grid: room.grid,
              players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                territories: p.territories,
                resources: p.resources,
                allies: p.allies,
                enemies: p.enemies
              }))
            });
          }
        } else {
          currentPlayer.memory.push(`Failed to attack (${hex.q}, ${hex.r})`);
          broadcast(room, { 
            message: `${currentPlayer.name}'s attack failed`,
            type: "update",
            grid: room.grid,
            players: room.players.map(p => ({
              id: p.id,
              name: p.name,
              territories: p.territories,
              resources: p.resources,
              allies: p.allies,
              enemies: p.enemies
            }))
          });
        }
      }

      // Move to next player's turn
      room.turn++;
      broadcast(room, { 
        message: `It's now ${room.players[room.turn % room.players.length].name}'s turn`,
        type: "update",
        grid: room.grid,
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          territories: p.territories,
          resources: p.resources,
          allies: p.allies,
          enemies: p.enemies
        }))
      });
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    // Find and clean up any rooms where this player was
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex((p) => p.ws);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        console.log(`Player ${player.name} disconnected from room ${roomId}`);

        // If game hasn't started, remove the player and their territory
        if (!room.started) {
          const startPositions = [
            { q: -2, r: 0 },
            { q: 2, r: 0 },
            { q: 0, r: -2 },
            { q: 0, r: 2 },
          ];
          const pos = startPositions[playerIndex];
          const hex = room.grid.find(h => h.q === pos.q && h.r === pos.r);
          if (hex) {
            hex.owner = null;
            player.territories--;
            player.resources -= hex.resources;
          }
          room.players.splice(playerIndex, 1);

          // Notify remaining players
          broadcast(room, {
            type: "update",
            grid: room.grid,
            players: room.players.map(p => ({
              id: p.id,
              name: p.name,
              personality: p.personality,
              territories: p.territories,
              resources: p.resources
            })),
            turn: room.turn,
            message: `${player.name} left. Waiting for ${
              4 - room.players.length
            } more players...`,
          });
        } else {
          // If game is in progress, notify other players
          broadcast(room, {
            type: "update",
            grid: room.grid,
            message: `${player.name} disconnected but their territories remain in play.`,
          });
        }
      }
    }
  });
});

function printMap(room: GameRoom) {
  console.log("\nCurrent Map:");
  room.grid.forEach((hex) => {
    console.log(`(${hex.q}, ${hex.r}): ${hex.owner || '.'}`);
  });
}

function broadcast(room: GameRoom, data: any) {
  // Create a visual representation of the map
  const mapView = room.grid.map((hex) => hex.owner || '.').join(" ");

  // Add map visualization to the broadcast data
  const enrichedData = {
    type: "update",
    grid: room.grid,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      personality: p.personality,
      territories: p.territories,
      resources: p.resources
    })),
    turn: room.turn,
    message: data.message || "",
    currentPlayer: room.players[room.turn % room.players.length]?.name || "",
    playerCount: room.players.length,
    started: room.started,
  };

  // Send update to all players
  room.players.forEach((p) => {
    try {
      p.ws.send(JSON.stringify(enrichedData));
    } catch (error) {
      console.error(`Error sending update to player ${p.name}:`, error);
    }
  });

  // Print the map to server console
  printMap(room);
  if (data.message) {
    console.log(data.message);
  }
}

async function runGameLoop(room: GameRoom) {
  room.turn = 0;
  const MAX_TURNS = 10;

  // Print initial state
  console.log("\n=== INITIAL STATE ===");
  printMap(room);

  // Broadcast initial state
  broadcast(room, { message: "Game started!" });

  while (room.turn < MAX_TURNS && room.players.length > 0) {
    room.turn++;
    console.log(`\n=== TURN ${room.turn} ===`);

    for (const player of room.players) {
      if (!player.ws) continue; // Skip disconnected players

      const gameState = createStateDescription(room, player);
      const prompt = buildPrompt(gameState);

      try {
        const res = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an AI controlling the faction '${player.name}' with a '${player.personality}' personality. Make strategic choices.`,
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        });

        const decision = res.choices[0].message?.content?.trim().toLowerCase() || "hold";
        console.log(`[${player.name}] Decision:`, decision);

        processDecision(room, player, decision);
        
        // Broadcast state after each player's turn
        broadcast(room, { 
          message: `${player.name} made their move: ${decision}`,
          type: "update"
        });
        
        await new Promise((res) => setTimeout(res, 2000));
      } catch (error) {
        console.error(`Error processing turn for ${player.name}:`, error);
        broadcast(room, { 
          message: `Error processing ${player.name}'s turn`,
          type: "error"
        });
      }
    }
  }

  // Calculate final results
  const finalResults = calculateFinalResults(room);

  // Print final results to console
  console.log("\n=== FINAL RESULTS ===");
  console.log("Final Map State:");
  printMap(room);

  console.log("\nFinal Standings:");
  finalResults.standings.forEach((standing, index) => {
    console.log(`${index + 1}. ${standing.name} (${standing.personality})`);
    console.log(`   Territories: ${standing.territories}`);
    console.log(`   Control: ${standing.controlPercentage}%`);
    console.log(`   Allies: ${standing.allies.join(", ") || "None"}`);
    console.log(`   Enemies: ${standing.enemies.join(", ") || "None"}`);
  });

  console.log(`\n🏆 Winner: ${finalResults.winner.name} (${finalResults.winner.personality})`);
  console.log(`Controlled ${finalResults.winner.controlPercentage}% of the map`);

  // Broadcast final results to all players
  broadcast(room, {
    type: "end",
    grid: room.grid,
    finalResults: finalResults,
    message: `🏆 Game Over! Winner: ${finalResults.winner.name} (${finalResults.winner.personality}) with ${finalResults.winner.controlPercentage}% control`
  });

  // Clean up the room
  console.log(`\nCleaning up room ${room.id}...`);
  
  // Close all WebSocket connections
  room.players.forEach(player => {
    try {
      player.ws.close();
    } catch (error) {
      console.error(`Error closing connection for player ${player.name}:`, error);
    }
  });

  // Remove the room from the rooms object
  delete rooms[room.id];
  console.log(`Room ${room.id} has been cleaned up.`);
}

function calculateFinalResults(room: GameRoom) {
  const totalHexes = room.grid.length;
  const standings = room.players.map(player => ({
    name: player.name,
    personality: player.personality,
    territories: player.territories,
    resources: player.resources,
    controlPercentage: Math.round((player.territories / totalHexes) * 100),
    allies: player.allies,
    enemies: player.enemies,
  }));

  standings.sort((a, b) => b.territories - a.territories);
  const winner = standings[0];

  return { standings, winner };
}

function createStateDescription(room: GameRoom, player: Player): string {
  const territories = countTerritories(room, player);
  const { neutralNeighbors, enemyNeighbors } = scanNeighbors(room, player);

  return `
Current Turn: ${room.turn}
Your Faction: ${player.name}
Personality: ${player.personality}
Controlled Territories: ${territories}
Allies: ${player.allies.join(", ") || "None"}
Enemies: ${player.enemies.join(", ") || "None"}
Adjacent Neutral Positions: ${neutralNeighbors.join(", ")}
Adjacent Enemy Positions: ${enemyNeighbors.join(", ")}
Recent Actions:
${
  player.memory
    .slice(-3)
    .map((m) => `- ${m}`)
    .join("\n") || "- No recent actions."
}

Current Grid State:
${room.grid.map((hex) => hex.owner || '.').join(" ")}
`;
}

function buildPrompt(stateDesc: string): string {
  return `Faction: ${stateDesc.split('\n')[1].split(': ')[1]}
Personality: ${stateDesc.split('\n')[2].split(': ')[1]}
Owned Territories: ${stateDesc.split('\n')[3].split(': ')[1]}
Allies: ${stateDesc.split('\n')[4].split(': ')[1]}
Enemies: ${stateDesc.split('\n')[5].split(': ')[1]}
Adjacent Neutral Regions: ${stateDesc.split('\n')[6].split(': ')[1]}
Adjacent Enemy Regions: ${stateDesc.split('\n')[7].split(': ')[1]}

Other Factions:
${stateDesc.split('\n').slice(8).join('\n')}

Memory:
${stateDesc.split('\n').slice(-3).join('\n')}

Strategic Guidelines:
- Each faction can only have ONE alliance
- Choose allies carefully as you cannot switch allies later
- Alliances lead to shared victory
- Territory control is important for victory
- Consider both short-term and long-term benefits of your actions
- Betraying allies may have long-term consequences
- If there are no empty territories, expand to the nearest neutral or enemy territory
- Only attack when there are valid enemy territories adjacent to your own
- Do not attempt to attack if there are no adjacent enemy territories
- Do not attack allies under any circumstances
- Attacks are always successful if the target is valid


Possible actions:
  Expand:( <RegionName>) (take unclaimed territory)
  Attack:( <RegionName>) (attack enemy territory - only if adjacent and not an ally)
  Ally: <FactionName> (form exclusive alliance for shared victory)
  Peace: <FactionName> (make peace with another faction)
  Trade: <FactionName> (trade resources with another faction)

Your decision:`;
}

function processDecision(room: GameRoom, player: Player, decision: string) {
  // Update enemy relationships before processing decision
  scanNeighbors(room, player);
  
  const playerHexes = room.grid.filter(h => h.owner === player.id);
  console.log(`[${player.name}] Processing decision: ${decision}`);
  
  if (decision.includes("expand")) {
    // Find a neutral hex adjacent to player's territory
    for (const hex of playerHexes) {
      const neighbors = getHexNeighbors(hex);
      for (const neighbor of neighbors) {
        const targetHex = room.grid.find(h => h.q === neighbor.q && h.r === neighbor.r);
        if (targetHex && !targetHex.owner) {
          targetHex.owner = player.id;
          player.territories++;
          player.resources += targetHex.resources;
          player.memory.push(`Expanded to (${targetHex.q}, ${targetHex.r})`);
          console.log(`${player.name} expands into (${targetHex.q}, ${targetHex.r})`);
          
          broadcast(room, {
            type: "update",
            grid: room.grid,
            players: room.players.map(p => ({
              id: p.id,
              name: p.name,
              territories: p.territories,
              resources: p.resources,
              allies: p.allies,
              enemies: p.enemies
            })),
            message: `${player.name} expanded their territory`
          });
          return;
        }
      }
    }
    player.memory.push("Failed to expand - no valid adjacent targets");
  } else if (decision.includes("attack")) {
    console.log(`[${player.name}] Attempting attack...`);
    // Find an enemy hex adjacent to player's territory
    for (const hex of playerHexes) {
      const neighbors = getHexNeighbors(hex);
      for (const neighbor of neighbors) {
        const targetHex = room.grid.find(h => h.q === neighbor.q && h.r === neighbor.r);
        if (targetHex && targetHex.owner && targetHex.owner !== player.id) {
          console.log(`[${player.name}] Found target hex at (${targetHex.q}, ${targetHex.r}) owned by ${targetHex.owner}`);
          
          // Check if target is an ally
          const targetPlayer = room.players.find(p => p.id === targetHex.owner);
          if (targetPlayer && player.allies.includes(targetPlayer.id)) {
            console.log(`[${player.name}] Cannot attack ally ${targetPlayer.name}`);
            player.memory.push(`Cannot attack ally ${targetPlayer.name}'s territory`);
            return;
          }

          const enemy = room.players.find(p => p.id === targetHex.owner);
          if (enemy) {
            console.log(`[${player.name}] Attack successful against ${enemy.name}`);
            
            // Remove territory from enemy's list
            enemy.territories--;
            enemy.resources -= targetHex.resources;
            
            // Add territory to attacker's list
            targetHex.owner = player.id;
            player.territories++;
            player.resources += targetHex.resources;
            
            // Update relationships
            if (!player.enemies.includes(enemy.id)) {
              player.enemies.push(enemy.id);
              enemy.enemies.push(player.id);
            }
            
            // Break any existing alliance
            const allyIndex = player.allies.indexOf(enemy.id);
            if (allyIndex !== -1) {
              player.allies.splice(allyIndex, 1);
              enemy.allies.splice(enemy.allies.indexOf(player.id), 1);
            }
            
            // Update memory
            player.memory.push(`Successfully attacked and captured (${targetHex.q}, ${targetHex.r}) from ${enemy.name}`);
            enemy.memory.push(`Lost territory at (${targetHex.q}, ${targetHex.r}) to ${player.name}`);
            
            // Broadcast the territory change
            broadcast(room, {
              message: `${player.name} captured territory from ${enemy.name} at (${targetHex.q}, ${targetHex.r})`,
              type: "update",
              grid: room.grid,
              players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                territories: p.territories,
                resources: p.resources,
                allies: p.allies,
                enemies: p.enemies
              }))
            });
            return;
          }
        }
      }
    }
    console.log(`[${player.name}] No valid adjacent attack targets found`);
    player.memory.push("Failed to attack - no valid adjacent targets");
  } else if (decision.includes("ally")) {
    // Find a player to ally with
    const targetCoords = decision.match(/\d+,\d+/);
    if (targetCoords) {
      const [q, r] = targetCoords[0].split(',').map(Number);
      const targetHex = room.grid.find(h => h.q === q && h.r === r);
      if (targetHex && targetHex.owner && targetHex.owner !== player.id) {
        const potentialAlly = room.players.find(p => p.id === targetHex.owner);
        if (potentialAlly && !player.enemies.includes(potentialAlly.id)) {
          // Check if either player already has an ally
          if (player.allies.length === 0 && potentialAlly.allies.length === 0) {
            player.allies.push(potentialAlly.id);
            potentialAlly.allies.push(player.id);
            player.memory.push(`Formed alliance with ${potentialAlly.name}`);
            potentialAlly.memory.push(`Formed alliance with ${player.name}`);
            return;
          } else {
            player.memory.push(`Cannot form alliance - one faction already has an alliance`);
            return;
          }
        }
      }
    }
    player.memory.push("Failed to form alliance - invalid target");
  } else if (decision.includes("peace")) {
    // Find a player to make peace with
    const targetCoords = decision.match(/\d+,\d+/);
    if (targetCoords) {
      const [q, r] = targetCoords[0].split(',').map(Number);
      const targetHex = room.grid.find(h => h.q === q && h.r === r);
      if (targetHex && targetHex.owner && targetHex.owner !== player.id) {
        const targetPlayer = room.players.find(p => p.id === targetHex.owner);
        if (targetPlayer) {
          const enemyIndex = player.enemies.indexOf(targetPlayer.id);
          if (enemyIndex !== -1) {
            player.enemies.splice(enemyIndex, 1);
            targetPlayer.enemies.splice(targetPlayer.enemies.indexOf(player.id), 1);
            player.memory.push(`Made peace with ${targetPlayer.name}`);
            targetPlayer.memory.push(`Made peace with ${player.name}`);
            return;
          }
        }
      }
    }
    player.memory.push("Failed to make peace - invalid target");
  } else if (decision.includes("trade")) {
    // Find a player to trade with
    const targetCoords = decision.match(/\d+,\d+/);
    if (targetCoords) {
      const [q, r] = targetCoords[0].split(',').map(Number);
      const targetHex = room.grid.find(h => h.q === q && h.r === r);
      if (targetHex && targetHex.owner && targetHex.owner !== player.id) {
        const targetPlayer = room.players.find(p => p.id === targetHex.owner);
        if (targetPlayer) {
          player.memory.push(`Traded with ${targetPlayer.name}`);
          targetPlayer.memory.push(`Traded with ${player.name}`);
          return;
        }
      }
    }
    player.memory.push("Failed to trade - invalid target");
  } else {
    // Hold action
    player.memory.push("Held position");
  }
}

function countTerritories(room: GameRoom, player: Player): number {
  return room.grid.filter(h => h.owner === player.name).length;
}

function scanNeighbors(
  room: GameRoom,
  player: Player
): {
  neutralNeighbors: string[];
  enemyNeighbors: string[];
} {
  const neutral = new Set<string>();
  const enemy = new Set<string>();

  // Get all hexes owned by the player
  const playerHexes = room.grid.filter(h => h.owner === player.id);

  for (const hex of playerHexes) {
    // Get only adjacent hexes
    const neighbors = getHexNeighbors(hex);
    for (const neighbor of neighbors) {
      const targetHex = room.grid.find(h => h.q === neighbor.q && h.r === neighbor.r);
      if (targetHex) {
        if (!targetHex.owner) {
          neutral.add(`(${neighbor.q}, ${neighbor.r})`);
        } else if (targetHex.owner !== player.id) {
          const adjacentPlayer = room.players.find(p => p.id === targetHex.owner);
          if (adjacentPlayer && !player.allies.includes(adjacentPlayer.id)) {
            enemy.add(`(${neighbor.q}, ${neighbor.r})`);
          }
        }
      }
    }
  }

  return {
    neutralNeighbors: Array.from(neutral),
    enemyNeighbors: Array.from(enemy),
  };
}

httpServer.listen(4000, () => console.log("Server listening on port 4000"));

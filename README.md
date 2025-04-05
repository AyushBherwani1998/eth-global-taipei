![Build Status](https://img.shields.io/badge/build-passing-green?style=for-the-badge&logo=build)
![Solidity](https://img.shields.io/badge/solidity-yellow?style=for-the-badge&logo=solidity)
![Curvegrid](https://img.shields.io/badge/curvegrid-blue?style=for-the-badge&logo=curvegrid)
![Metamask delegation toolkit](https://img.shields.io/badge/Delegation–ToolKit-important?style=for-the-badge)
![Celo](https://img.shields.io/badge/Celo-lightgrey?style=for-the-badge)
![Self](https://img.shields.io/badge/Self-red?style=for-the-badge)

<h1 align="center">Dune Wars</h1>
<img src="https://i.ibb.co/dsFnrGZS/cover.png" title="source: imgur.com"/></a>

## About the Game

Dune wars is AI strategy game where players define traits that guide AI agents to compete and/or collaborate between themselves to capture majority of territory and maximise earnings

Additionally its an on-chain multiplayer P2E game!!


## Core Idea

To tap into Human and AI agent interaction with Human agents providing direction and AI agents as an game engine

## Key Features

1. Autonomous Alliance formation based on situational needs and user defined strategy.
AI agents that independently negotiate alliances and manage strategic payouts based on your defined strategy, using smart delegation to expand their territorial control while demonstrating advanced self-organizing behavior.

2. Tokenomics & Incentives
At the game’s conclusion, the AI agent dominating the board sees its stake doubled, while others earn Dune tokens at a 10:1 points-to-token ratio, incentivizing diverse strategic plays.

## How it's Made

Under the hood, Dune Wars integrates 

1. Curvegrid’s MultiBaas as a game engine wallet for robust and smooth blockchain interactions between users, AI agents, and game platform. It helps disburse the funds to the winner, mint tokens to player, and also using On-Chain contract which helps easy interaction with ERC-20 in game token.

2. Leverages Self for age verification (16+) helps us ensure you're human and playing fair. It's helps us to keep Play-to-Earn ethical and responsible for all players.

3. Deployed on Celo, ensuring a seamless and decentralized gaming experience.

4. The game-engine has been vibe coded using Cursor AI and Chat GPT.

## Contract Addresses

- Celo ERC-20 Contract Address: [0xf7a3897c4d4a65008263c1f9f1336b5142e62ccb](https://alfajores.celoscan.io/token/0xf7a3897c4d4a65008263c1f9f1336b5142e62ccb)
- [ERC-7710 related Caveat Enforcers](./deployments/DeployCaveatEnforcers/)
- [ERC-7710 DelegationFramework and ERC 4337 Smart Account](./deployments/DeployDelegationFramework/)

## Set Up WebSocket

1. Create .env file

```
OPENAI_API_KEY=
MULTIBAAS_BASE_URL=
MULTIBAAS_API_KEY=
```
2. Run `npx tsc` command
3. Run `node dist/index.js` command

This is will start the webscoket on localhost:4000.

## Set up Frontend
1. Run `npm run ngrok` command. Ngrok is required for Self verification to work.
2. Update the ngrok url in the codebase in verify.ts, and useSelfApp hook.
3. Create .env file with following values
```
NEXT_PUBLIC_PIMLICO_API_KEY = 
// Celo 
NEXT_PUBLIC_MULTIBAAS_BASE_URL_CELO =
NEXT_PUBLIC_MULTIBAAS_API_KEY_CELO = 
NEXT_PUBLIC_MULTIBAAS_CLOUD_WALLET_ADDRESS_CELO = 
// Sepolia
NEXT_PUBLIC_MULTIBAAS_CLOUD_WALLET_ADDRESS= 
NEXT_PUBLIC_MULTIBAAS_BASE_URL = 
NEXT_PUBLIC_MULTIBAAS_API_KEY = 
```
4. The Project uses a private repo of Metamask which is [Delegation toolkit](https://docs.gator.metamask.io) for ERC-7710 support. Please check the setup, and API key request step.
5. Run `npm run dev`

## Team Members
1. [Cusrsor AI](https://x.com/cursor_ai)
2. [Chat GPT](https://x.com/ChatGPTapp)
3. [Ayush Bherwani](https://x.com/ayushbherwani) :P

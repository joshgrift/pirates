# Pirates

## Client

Standard Vanilla Typescript SPA built with webpack.

- `npm run build` - Convert `src` into `dist`
- `npm run serve` - Start local development Server

## Server

Standard NodeJS environment

- `npm run build` - build a dist folder
- `npm start` - runs the `index.ts` in nodejs

## Protocol

Protocol is defined in `Protocol.ts` in both client and server. These files should be in sync.

## Maps

Maps are created with [Tiled](https://thorbjorn.itch.io/tiled). Use `map.tmx` template when creating maps. Use pirates.tsx as the tileset. To copy the map into the world, export the map as a csv and tileset as json and copy both in the server directory.

## Bucket List

- Emotes
- User Accounts
- Buildings
- Interacting with buildings
- Sounds
- UI overhaul
- trading
- Upgrades
  - Extra cannon
  - More cannon damage
  - Ship capacity
  - Ship health
  - Higher max speed
  - More acceleration
  - Trade bonus
  - Medic and repairman
  - Dingy when your ship sinks
- Inventory
- Ship capacity
- Quests
- AI Ships
- Clans
  - Global Clan Score
  - Clan territory
  - Clan war
  - Clan rank
- Skins?
  - Unlock emotes?
  - Unlock skins?
  - Sound Emotes?
- Private Servers?

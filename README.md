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

Maps are created with [Tiled](https://thorbjorn.itch.io/tiled). Use the `pirates.tsx` tileset and create a map of any set size with the following settings:
![maps/tiled_settings.png]
Size is optional. Server will merge all layers into terrain for world. Load the `.tmx` file into the server. Pirates does not support rotation at this time.

### Buildings

Buildings are loaded in a seperate json file. See an example in `/maps/`.

## Bucket List

- Emotes
- User Accounts
- Buildings
- Sounds
- UI overhaul
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

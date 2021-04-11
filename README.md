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

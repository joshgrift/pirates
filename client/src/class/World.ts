import { Entity, Structure, Terrain } from "./WorldObjects";

export class World {
  terrain: Terrain[] = [];
  entities: Entity[] = [];
  structures: Structure[] = [];
  player: Player;

  constructor() {
    this.player = new Player();
  }

  getTerrains(): Terrain[] {
    return this.terrain;
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  getStructures(): Structure[] {
    return this.structures;
  }

  getPlayer(): Player {
    return this.player;
  }
}

class Player {}

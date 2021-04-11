import * as fs from "fs";
import { parse } from "csv";
import { TerrainInTransit, TerrainType } from "./Protocol";

var TILE_SIZE = 32;

export function loadMap(mapPath: string): Promise<TerrainInTransit[]> {
  var p = new Promise<TerrainInTransit[]>((resolve, reject) => {
    var y = 0;
    let terrains: TerrainInTransit[] = [];

    fs.createReadStream(mapPath)
      .pipe(new parse.Parser({}))
      .on("data", (row: string[]) => {
        let x = 0;
        row.forEach((t) => {
          if (parseInt(t) >= 0) {
            terrains.push({
              x: x * TILE_SIZE,
              y: y * TILE_SIZE,
              type: TerrainType.GRASS,
              sprite: parseInt(t),
            });
          }
          x++;
        });
        y++;
      })
      .on("end", () => {
        resolve(terrains);
      });
  });

  return p;
}

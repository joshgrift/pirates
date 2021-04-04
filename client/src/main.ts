import { Game } from "./class/Game";

let c = document.querySelector("canvas");

if (c) {
  let game = new Game(c);
  game.render();
} else {
  throw Error("Canvas not found");
}

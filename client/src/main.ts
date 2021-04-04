import { Game } from "./class/Game";

let c = document.querySelector("canvas");

if (c) {
  new Game(c);
} else {
  throw Error("Canvas not found");
}

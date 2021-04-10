import { Game } from "./class/Game";
import { Skin } from "./Protocol";

let c = document.querySelector("canvas");

var startSection = document.querySelector(".ui") as HTMLElement;
var gameSection = document.querySelector(".inGameUi") as HTMLElement;

if (gameSection) {
  gameSection.style.display = "none";
}

var b = document.getElementById("startButton");

b?.addEventListener("click", (e) => {
  var i = document.getElementById("name") as HTMLInputElement;
  var s = document.getElementById("skin") as HTMLSelectElement;

  if (c && i && s) {
    new Game(c, i.value, (parseInt(s.value) as any) as Skin);
  }

  if (gameSection) {
    gameSection.style.display = "block";
  }

  if (startSection) {
    startSection.style.display = "none";
  }
});
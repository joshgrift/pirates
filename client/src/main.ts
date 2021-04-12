import { Game } from "./class/Game";
import { Skin } from "../../shared/Protocol";

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
    try {
      new Game(c, i.value, (parseInt(s.value) as any) as Skin);
    } catch (e) {
      console.log("error");
    }
  }

  if (gameSection) {
    gameSection.style.display = "block";
  }

  if (startSection) {
    startSection.style.display = "none";
  }
});

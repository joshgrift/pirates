import { Game, GameEvent } from "./class/Game";
import { Cargo, Skin } from "../../shared/Protocol";

let c = document.querySelector("canvas");

var startSection = document.querySelector(".ui") as HTMLElement;
var gameSection = document.querySelector(".inGameUi") as HTMLElement;
var portUI = document.querySelector(".port") as HTMLElement;
var playerList = document.querySelector("#player_list") as HTMLElement;
let game: Game;

let openUI: string | null = null;

if (gameSection) {
  gameSection.style.display = "none";
}

var b = document.getElementById("startButton");

b?.addEventListener("click", (e) => {
  var i = document.getElementById("name") as HTMLInputElement;
  var s = document.getElementById("skin") as HTMLSelectElement;

  if (c && i && s) {
    try {
      game = new Game(c, i.value, (parseInt(s.value) as any) as Skin);
      game.on(GameEvent.ARRIVE_PORT, (d) => {
        if (d.port && !openUI) {
          portUI.style.left = "0px";
          portUI.innerHTML = `
            <h1>${d.port.name}</h1>
            <ul>
              ${(() => {
                let r = "";
                for (var i in d.port.store) {
                  r += `<li><b>${i}</b> <br> <span id="buy_${i}">b:${d.port.store[i].buy}</span> <span id="sell_${i}">s:${d.port.store[i].sell}</span></li>`;
                }
                return r;
              })()}
              <button id="repair_button">Repair (1 wood)</button>
            </ul>
          `;

          for (var i in d.port.store) {
            document.getElementById("buy_" + i)?.addEventListener(
              "click",
              (function (i) {
                return function () {
                  game.buy(i as Cargo);
                };
              })(i)
            );

            document.getElementById("sell_" + i)?.addEventListener(
              "click",
              (function (i) {
                return function () {
                  game.sell(i as Cargo);
                };
              })(i)
            );
          }

          document
            .getElementById("repair_button")
            ?.addEventListener("click", () => {
              game.repair();
            });

          openUI = "port";
        }
      });
      game.on(GameEvent.LEAVE_PORT, (d) => {
        if (openUI) {
          portUI.style.left = "-200px";
          openUI = null;
        }
      });

      game.on(GameEvent.UI_UPDATE, (d) => {
        if (d.ui) {
          gameSection.innerHTML =
            `${d.ui.acceleration} px/t^2 => ${d.ui.speed} px/t | ${d.ui.health}% | ${d.ui.heading} degrees | ${d.ui.ping} ms | ${d.ui.kills} kills | ${d.ui.x}, ${d.ui.y} | dead: ${d.ui.dead} | $${d.ui.money} <br>` +
            `${JSON.stringify(d.ui.inventory)}`;
          playerList.innerHTML = `<li>${d.ui.playerID} - ${d.ui.kills} / ${
            d.ui.deaths
          } K/D</li>
          ${(() => {
            var r = "";
            for (let p of d.ui.players) {
              r += `<li>${p.id} - ${p.kills} / ${p.deaths} K/D</li>`;
            }
            return r;
          })()}
          `;
        }
      });
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

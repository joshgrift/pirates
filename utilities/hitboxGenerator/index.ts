import { createCanvas, loadImage } from "canvas";

const DEBUG = true;
var map: string = "";

function toHex(s: string): string {
  var mapString = "";

  for (var i = 0; i < s.length; i += 4) {
    mapString += parseInt(s.substr(i, 4), 2).toString(16);
  }

  return mapString;
}

loadImage(process.argv[2]).then((image) => {
  let drawWidth = Math.round(image.width / 2);
  let drawHeight = Math.round(image.height / 2);
  const canvas = createCanvas(drawWidth, drawHeight);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    0,
    0,
    drawWidth,
    drawHeight
  );

  for (let y = 0; y < drawHeight; y++) {
    for (let x = 0; x < drawWidth; x++) {
      if (ctx.getImageData(x, y, 1, 1).data[3] == 0) {
        map += "0";
      } else {
        map += "1";
      }
    }
  }

  if (DEBUG) {
    console.log(canvas.toDataURL());
  }

  console.log(map);

  console.log(toHex(map) + ":" + drawHeight + "," + drawWidth);
});

export function random(x: number) {
  return Math.ceil(x * Math.random());
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function normalize(input: string) {
  return input.trim().replace(" ", "_").replace("'", "-");
}

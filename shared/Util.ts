/**
 * Standard Utils Library
 */

/**
 * Get a random number between 1 and x
 * @param x
 * @returns
 */
export function random(x: number): number {
  return Math.ceil(x * Math.random());
}

/**
 * Calculate the distance between x1, y1 and x2, y2
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns distance
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * Convert descriptive string to id
 *
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 *
 * @param input
 * @returns
 */
export function packString(input: string): string {
  var hash = 0,
    i,
    chr;
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash + "";
}

/**
 * Remove dangerous characters from string for display
 * Caps string at 32 characters
 * TODO: scan for illegal words in the future
 * @param input
 * @returns string safe for display
 */
export function purifyString(input: string): string {
  return input
    .replace("'", "&#39;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace("&", "&amp;")
    .replace('"', "&quot;")
    .substr(0, 32);
}

/**
 * Round a number to i number of decimal places
 * @param n value to round
 * @param i number of decimal places
 * @returns number rounded to i decimal places
 */
export function decimalRound(n: number, i: number = 1): number {
  return Math.round(Math.pow(10, i) * n) / Math.pow(10, i);
}

/**
 * Avg all values in d
 * @param d array of numbers
 * @returns avg of values
 */
export function avg(d: number[]): number {
  var sum = 0;
  for (let n of d) {
    sum += n;
  }

  return Math.round(sum / d.length);
}

/**
 * Timer to calculating average times of actions
 */
export class Timer {
  last: number = 0;
  list: number[] = [];
  MAX: number = 10;

  /**
   * Start timer
   */
  startTimer(): void {
    this.last = Date.now();
  }

  /**
   * End timer and store value
   */
  stopTimer(): void {
    this.list.push(Date.now() - this.last);
    if (this.list.length > this.MAX) {
      this.list.shift();
    }
  }

  /**
   * Average of the last values
   * @return
   */
  getAvg(): number {
    return avg(this.list);
  }
}

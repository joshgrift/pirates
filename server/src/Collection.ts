export class Collection<T> implements Iterable<T> {
  data: { [id: string]: T } = {};

  add(id: string, t: T) {
    this.data[id] = t;
  }

  get(id: string): T | null {
    if (this.data[id]) {
      return this.data[id];
    } else {
      return null;
    }
  }

  remove(id: string) {
    delete this.data[id];
  }

  forEach(callback: (t: T) => void) {
    Object.keys(this.data).forEach((i: string) => {
      callback(this.data[i]);
    });
  }

  [Symbol.iterator]() {
    let count: number = -1;
    let keys = Object.keys(this.data);

    return {
      next: () => {
        count++;
        return {
          done: (count == keys.length) as boolean,
          value: this.data[keys[count]],
        };
      },
    };
  }

  update(id: string, t: T) {
    if (this.data[id]) {
      this.data[id] = t;
    } else {
      throw Error("Does not exist");
    }
  }

  length(): number {
    return Object.keys(this.data).length;
  }

  toJSON(): T[] {
    let result: T[] = [];

    this.forEach((i) => result.push(i));

    return result;
  }
}

export class Transaction<T, ID extends string | number> {
  private readonly _current: T[];
  private readonly _initialIDs: Set<ID>;
  private readonly _modified: Map<ID, T | undefined>;

  constructor(
    initial: T[],
    readonly identifier: (item: T) => ID,
  ) {
    this._current = [...initial];
    this._modified = new Map();
    this._initialIDs = new Set(initial.map(this.identifier));

    if (this._initialIDs.size !== this._current.length) {
      throw new Error("Duplicate IDs in initial data.");
    }
  }

  getActions() {
    return {
      // Everything in the current array that wasn't in the initial set.
      add: this._current.filter(
        (x) => !this._initialIDs.has(this.identifier(x)),
      ),

      // Everything in the modified map that was also in the initial set (except
      // the undefined values).
      update: [...this._modified.entries()]
        .filter(
          (x): x is [ID, T] => this._initialIDs.has(x[0]) && x[1] !== undefined,
        )
        .map(([_, value]) => value),

      // The IDs of everything in the modified map that is undefined.
      delete: [...this._modified.entries()]
        .filter(([_, value]) => value === undefined)
        .map(([id, _]) => id),
    };
  }

  getValues() {
    return [...this._current];
  }

  [Symbol.iterator]() {
    return this.getValues().values();
  }

  add(...items: T[]) {
    for (const item of items) {
      this._addSingle(item);
    }
  }

  private _addSingle(item: T) {
    const id = this.identifier(item);
    if (this._current.some((x) => this.identifier(x) === id)) {
      throw new Error("Can't add - already exists.");
    }
    this._current.push(item);
    this._modified.set(id, item);
  }

  update(item: T) {
    const id = this.identifier(item);
    const idx = this._current.findIndex((x) => this.identifier(x) === id);
    if (idx === -1) {
      throw new Error("Can't update - doesn't exist or was deleted.");
    }
    this._current[idx] = item;
    this._modified.set(id, item);
  }

  delete(id: ID) {
    const idx = this._current.findIndex((x) => this.identifier(x) === id);
    if (idx === -1) {
      throw new Error("Can't delete - doesn't exist or already deleted.");
    }
    this._current.splice(idx, 1);
    if (this._initialIDs.has(id)) {
      this._modified.set(id, undefined);
    } else {
      this._modified.delete(id);
    }
  }

  deleteItem(item: T) {
    this.delete(this.identifier(item));
  }

  some(predicate: (item: T) => boolean) {
    return this._current.some(predicate);
  }

  find(predicate: (item: T) => boolean) {
    return this._current.find(predicate);
  }
}

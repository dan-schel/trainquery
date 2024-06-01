export class Transaction<T, ID> {
  private readonly _current: T[];
  private readonly _initialIDs: Set<ID>;
  private readonly _modified: Map<ID, T | null>;

  constructor(
    initial: T[],
    readonly identifier: (item: T) => ID,
  ) {
    this._current = [...initial];
    this._modified = new Map();
    this._initialIDs = new Set(initial.map(this.identifier));
  }

  get actions() {
    return {
      // Everything in the current array that wasn't in the initial set.
      add: this._current.filter(
        (x) => !this._initialIDs.has(this.identifier(x)),
      ),

      // Everything in the modified map that was also in the initial set (except
      // the nulls).
      update: [...this._modified.entries()]
        .filter(([id, value]) => this._initialIDs.has(id) && value != null)
        .map(([_, value]) => value),

      // The IDs of everything in the modified map that is null.
      remove: [...this._modified.entries()]
        .filter(([_, value]) => value == null)
        .map(([id, _]) => id),
    };
  }

  get value() {
    return [...this._current];
  }

  [Symbol.iterator]() {
    return this._current.values();
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
      throw new Error("Can't update - doesn't exist or was removed.");
    }
    this._current[idx] = item;
    this._modified.set(id, item);
  }

  delete(id: ID) {
    const idx = this._current.findIndex((x) => this.identifier(x) === id);
    if (idx === -1) {
      throw new Error("Can't remove - doesn't exist or already removed.");
    }
    this._current.splice(idx, 1);
    this._modified.set(id, null);
  }

  some(predicate: (item: T) => boolean) {
    return this._current.some(predicate);
  }

  find(predicate: (item: T) => boolean) {
    return this._current.find(predicate);
  }
}

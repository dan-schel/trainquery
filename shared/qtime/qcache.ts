export class QCache<K, V> {
  private readonly _map: Map<string, V>;

  constructor(
    private readonly _calculate: (value: K) => V,
    private readonly _hashify: (value: K) => string,
    private readonly _maxSize: number
  ) {
    this._map = new Map();
  }

  get(key: K): V {
    const hash = this._hashify(key);
    const existing = this._map.get(hash);
    if (existing != null) {
      return existing;
    }
    const value = this._calculate(key);
    if (this._map.size >= this._maxSize) {
      this._map.clear();
    }
    this._map.set(hash, value);
    return value;
  }
}

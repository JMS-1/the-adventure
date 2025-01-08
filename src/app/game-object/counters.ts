/** May ocunt actions. */
export class ActionCounters {
  /** Current counters. */
  private readonly _counts: Record<string, number> = {};

  /**
   * See if a counted action is allowed to execute.
   *
   * @param key unique name of the action.
   * @param counts counters to check.
   * @param debug debug helper.
   * @returns set if the action can be executed.
   */
  allowAction(
    key: string,
    counts: number[],
    debug?: (message: string) => void
  ) {
    /** Technically the key may be not yet initialized. */
    let count = this._counts[key];

    debug?.(`${key} at ${count}`);

    if (typeof count !== 'number') return false;

    /** All but the last count are one-shots. */
    for (let i = 0; i < counts.length - 1; i++) {
      /** Not yet reached. */
      if (count < counts[i]) return false;

      /** Full match. */
      if (count === counts[i]) return true;

      /** Advance to next. */
      count -= counts[i];
    }

    /** Last count is repeated. */
    return count % counts[counts.length - 1] === 0;
  }

  /**
   * Reset a specific action counter.
   *
   * @param key unique name of the action.
   */
  resetActionCounter(key: string) {
    delete this._counts[key];
  }

  /**
   * Increment some action counter.
   *
   * @param key unique name of the action.
   */
  incrementActionCounter(key: string) {
    this._counts[key] = (this._counts[key] ?? 0) + 1;
  }

  /** Create a JSON representation. */
  save() {
    return {
      counters: this._counts,
    };
  }

  /**
   * Reconstruct a call to save.
   *
   * @param serialized serialized state.
   */
  load(serialized: unknown) {
    const json = serialized as ReturnType<ActionCounters['save']>;

    for (const key of Object.keys(json.counters))
      this._counts[key] = json.counters[key];
  }
}

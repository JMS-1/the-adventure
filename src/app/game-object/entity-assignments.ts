import { GameObject } from '.';
import { GameService } from '../services/game.service';

/** Manager the active dynamic positions of entities. */
export class EntityAssignments {
  /** Entities for each entity or state. */
  private readonly _carried: Record<string, Set<string>> = {};

  /**
   * Add some entity to a parent.
   *
   * @param entity entity to add.
   * @param parent parent the entity should belong to.
   */
  add(entity: GameObject, parent: GameObject) {
    this._carried[parent.key].add(entity.name);
  }

  /**
   * Initialize the list of entities of a parent.
   *
   * @param parent the parent of interest.
   * @param children the original set of entities for the parent -
   * must be cloned since may change during the game.
   */
  set(parent: GameObject, children: Set<string>) {
    this._carried[parent.key] = new Set(children);
  }

  /**
   * Delete a single entity from all parents.
   *
   * @param entity entity to get rid of.
   */
  delete(entity: GameObject) {
    Object.values(this._carried).forEach((s) => s.delete(entity.name));
  }

  /**
   * See if an entity belongs to a parent.
   *
   * @param parent the parent to inspect.
   * @param entity the entity of interest.
   * @returns set if the entity belongs to the parent.
   */
  has(parent: GameObject, entity: GameObject) {
    return this._carried[parent.key].has(entity.key);
  }

  /**
   * Get all enttities of a parent.
   *
   * @param parent parent to check.
   * @returns list of associated entities.
   */
  children(parent: GameObject) {
    return this._carried[parent.key] ?? new Set();
  }

  /**
   * Prepare to persist state.
   *
   * @returns JSON representation of the assigments.
   */
  save() {
    return {
      entities: Object.keys(this._carried).reduce(
        (m, p) => ((m[p] = Array.from(this._carried[p])), m),
        {} as Record<string, string[]>
      ),
    };
  }

  /**
   * Reconstruct all assigments from the persisted stated.
   *
   * @param saved result from a call to save.
   * @param game current active game which will be restored.
   *
   * @returns The assigmentse representing the JSON representation.
   */
  load(saved: unknown, game: GameService) {
    const json = saved as ReturnType<EntityAssignments['save']>;

    for (const p of Object.keys(json.entities))
      this.set(
        game.states.states[p] ?? game.objects.findEntity(p),
        new Set(json.entities[p])
      );
  }
}

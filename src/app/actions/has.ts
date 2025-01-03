import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** Check if the player or a game objects holds a sepcific entity */
export class HasAction extends Action {
  /** 'if_has' ' ' <entity> */
  public static readonly Pattern = /^(#)?if_has\s+([^\s]+)/;

  /** Entity to test for. */
  entity!: Entity;

  /**
   * Create the action.
   *
   * @param what entity to check for.
   * @param self check to see if some game object holds the entity - and not the player.
   * @param actions actions to execute.
   */
  private constructor(
    public readonly what: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  /**
   * Analyse the parsed statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HasAction(match[2], !!match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Make sure entity exists. */
    this.entity = game.objects.findEntity(this.what);

    /** Validate all actions of the body. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`test ${this.self ? scope.key : 'me'} has ${this.entity.key}`);

    /** Check against the parent and execute actions. */
    const has = this.self
      ? game.player.carriedObjects.has(scope, this.entity)
      : game.player.inventory.has(this.entity.key);

    if (has) Action.run(this.actions, scope, game);
  }
}

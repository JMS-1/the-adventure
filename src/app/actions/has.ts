import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';
import { ActionWithActions } from './with-actions';

/** Check if the player or a game objects holds a sepcific entity */
export class HasAction extends ActionWithActions {
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
    actions: Action[]
  ) {
    super(actions);
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
    super.validate(game, scope);

    /** Make sure entity exists. */
    this.entity = game.objects.findEntity(this.what);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    game.debug(`test ${this.self ? scope.key : 'me'} has ${this.entity.key}`);

    /** Check against the parent and execute actions. */
    const has = this.self
      ? game.player.carriedObjects.has(scope, this.entity)
      : game.player.inventory.has(this.entity.key);

    return !has || Action.run(this.actions, scope, game);
  }
}

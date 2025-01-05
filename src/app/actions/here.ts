import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';
import { ActionWithActions } from './with-actions';

/** See if some entity is lying around in the current room. */
export class HereAction extends ActionWithActions {
  /** 'if_here' ' ' <entity> */
  public static readonly Pattern = /^if_here\s+([^\s]+)/;

  /** Entity of interest. */
  entity!: Entity;

  /**
   * Create the action.
   *
   * @param what entity of interest.
   * @param actions actions to execute.
   */
  private constructor(public readonly what: string, actions: Action[]) {
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
    return new HereAction(match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: Entity | Room): void {
    super.validate(game, scope);

    /** Make sure the entity exists. */
    this.entity = game.objects.findEntity(this.what);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`test ${this.entity.key} to be here`);

    /** See if the entity lies in the current room and proceed accordingly. */
    const here = game.player.carriedObjects.has(game.player.room, this.entity);

    if (here) Action.run(this.actions, scope, game);
  }
}

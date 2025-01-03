import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** See if some entity is lying around in the current room. */
export class HereAction extends Action {
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
  private constructor(
    public readonly what: string,
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
    return new HereAction(match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    /** Make sure the entity exists. */
    this.entity = game.objects.findEntity(this.what);

    /** Forward to all actions in body. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test ${this.entity.key} to be here`);

    /** See if the entity lies in the current room and proceed accordingly. */
    const here = game.player.carriedObjects.has(game.player.state, this.entity);

    if (here) Action.run(this.actions, scope, game);
  }
}

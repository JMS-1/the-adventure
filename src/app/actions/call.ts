import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** Call one action of an entity. */
export class CallAction extends Action {
  /** [@]<entity> <action> */
  public static readonly Pattern = /^(@)?([^\s,)=]+)\s+([^\s,)=]+)/;

  /** The entity to use. */
  private _entity!: Entity;

  /** List of actions to call. */
  private _actions!: Action[];

  /**
   * Create a new action.
   *
   * @param _what name of the entity.
   * @param _action name of the action.
   * @param _silent suppress any output.
   */
  private constructor(
    private readonly _what: string,
    private readonly _action: string,
    private readonly _silent: boolean
  ) {
    super();
  }

  /**
   * Analyse the call statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new CallAction(match[2], match[3], !!match[1]);
  }

  override validate(game: GameService): void {
    /** Resolve entity and action. */
    this._entity = game.objects.findEntity(this._what);
    this._actions = this._entity.actions[this._action];

    if (!this._actions)
      throw new Error(`${this._what}: no action ${this._action}`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(
      `${this._silent ? 'silent ' : ''} call ${this._action} of ${
        this._entity.key
      }`
    );

    game.execute(
      () => Action.run(this._actions, this._entity, game),
      this._silent
    );
  }
}

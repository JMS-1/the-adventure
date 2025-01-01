import { Action } from '.';
import { GameObject } from '../game-object';
import { ThingOrPerson } from '../game-object/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class CallAction extends Action {
  public static readonly Pattern = /^(@)?([^\s,)=]+)\s+([^\s,)=]+)/;

  private _thingOrPerson!: ThingOrPerson;

  private _actions!: Action[];

  private constructor(
    private readonly _what: string,
    private readonly _action: string,
    private readonly _silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new CallAction(match[2], match[3], !!match[1]);
  }

  override validate(game: GameService): void {
    this._thingOrPerson = game.objects.getThingOrPerson(this._what);
    this._actions = this._thingOrPerson.actions[this._action];

    if (!this._actions)
      throw new Error(`${this._what}: no action ${this._action}`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(
      `call${this._silent ? '-silent' : ''} ${this._action} of ${
        this._thingOrPerson.key
      }`
    );

    Action.run(this._actions, this._thingOrPerson, game);
  }
}

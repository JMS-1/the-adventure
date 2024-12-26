import { Action } from '.';

export class TestPositionAction extends Action {
  public static readonly Pattern =
    /^(#)?if_position\s+\$\$([^$]+)\$([^\s]+)\s?/;

  constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly always: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }
}

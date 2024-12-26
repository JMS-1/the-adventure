export abstract class Action {}

export class MessageAction extends Action {
  constructor(
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }
}

export class PickAction extends Action {
  constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly always: boolean
  ) {
    super();
  }
}

export class DeadAction extends Action {
  constructor(public readonly reason: string) {
    super();
  }
}

export class MoveAction extends Action {
  constructor(
    public readonly area: string | null,
    public readonly room: string,
    public readonly always: boolean
  ) {
    super();
  }
}

export class PrintAction extends Action {
  constructor(public readonly obj: string, public readonly message: string) {
    super();
  }
}

export class TestMessageAction extends Action {
  constructor(
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }
}

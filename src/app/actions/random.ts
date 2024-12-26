import { Action } from '.';

export class RandomAction extends Action {
  constructor(public readonly choices: Action[]) {
    super();
  }
}

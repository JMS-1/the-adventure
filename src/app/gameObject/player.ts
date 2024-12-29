import { State } from './state';
import { Time } from './time';
import { Weight } from './weight';

export class Player {
  constructor(public state: State, public weight: Weight, public time: Time) {}
}

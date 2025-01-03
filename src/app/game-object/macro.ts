import { Entity } from './entity';

/** Prototype for entities. */
export class Macro extends Entity {
  /**
   * Create a new prototype.
   *
   * @param name name of the template.
   */
  constructor(name: string) {
    super(name, '', null);
  }
}

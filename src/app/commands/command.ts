export type CommandMap = Record<string, Command>;

/** Single command detected from user input. */
export class Command {
  /** Command key to use if an entity is mentioned. */
  readonly objectKeys = new Set<string>();

  /** Command key to use if no entity is mentioned. */
  readonly keys = new Set<string>();

  /** Next paring level. */
  readonly next: CommandMap = {};
}

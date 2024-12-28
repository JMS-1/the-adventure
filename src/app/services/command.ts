export type CommandMap = Record<string, Command>;

export class Command {
  objectKeys = new Set<string>();

  keys = new Set<string>();

  readonly next: CommandMap = {};
}

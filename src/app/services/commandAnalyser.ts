import { Command, CommandMap } from './command';

export class CommandAnalyser {
  readonly words: string[];

  constructor(cmd: string) {
    this.words = Array.from(this.split(cmd.toLowerCase()));
  }

  private *split(cmd: string) {
    cmd = cmd.trim();

    while (cmd) {
      const quoted = cmd.startsWith('"');

      let end = cmd.indexOf(quoted ? '"' : ' ', quoted ? 1 : 0);

      if (end < 0) end = cmd.length;
      else if (quoted) end++;

      const word = cmd.substring(0, end);

      cmd = cmd.substring(end).trim();

      yield word;
    }
  }

  *analyse(map: CommandMap) {
    let lastCommand: Command = null!;

    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];

      let command = map[word.startsWith('"') ? '*' : word];

      if (command) {
        /* Word recognized. */
        lastCommand = command;
      } else if (word.length >= 4) {
        // Not a short word.
        break;
      } else if (lastCommand && i === this.words.length - 1) {
        /* Make previous command the latest. */
        command = lastCommand;
      } else {
        /* Nothing recognized so far. */
        continue;
      }

      if (i === this.words.length - 1) {
        for (const key of command.keys) yield key;

        break;
      }

      map = command.next;
    }
  }
}

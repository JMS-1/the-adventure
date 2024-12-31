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

  *analyse(
    map: CommandMap,
    thingsOrPersons: Record<string, string>
  ): Generator<[string, string]> {
    /* May reference at least one thing or person. */
    let thingOrPerson: string = null!;

    /* The command which will report. */
    let lastCommand: Command = null!;

    for (let i = 0; i < this.words.length; i++) {
      /* See if the word is part of the current command .*/
      const word = this.words[i];

      let command = map[word.startsWith('"') ? '*' : word];

      if (command) {
        /* Word recognized as part of the command tree. */
        lastCommand = command;
      } else if (thingsOrPersons[word] && !thingOrPerson) {
        /* Word is a thing or person. */
        command = map['%'];

        if (command) {
          /* Explizit thing or persoen named in sentence. */
          lastCommand = map['%'];
          thingOrPerson = thingsOrPersons[word];
        } else if (
          i === this.words.length - 1 &&
          lastCommand?.objectKeys.size
        ) {
          /* Thing or person at the very end. */
          command = lastCommand;
          thingOrPerson = thingsOrPersons[word];
        }
      }

      /* No command found and also not a thing or person. */
      if (!command) {
        /* May ignore words shorter than four characters. */
        if (word.length >= 4) break;

        /* Skip if not at the very end - and a command has alreay been recognized. */
        if (i !== this.words.length - 1 || !lastCommand) continue;

        /* Make previous command the latest. */
        command = lastCommand;
      }

      /* Sentence is fully analysed. */
      if (i === this.words.length - 1) {
        /* Always prefer reporting a command on a thing or person. */
        if (thingOrPerson)
          for (const key of command.objectKeys) yield [key, thingOrPerson];
        else for (const key of command.keys) yield [key, ''];

        break;
      }

      /* Dive int the command tree. */
      map = command.next;
    }
  }
}
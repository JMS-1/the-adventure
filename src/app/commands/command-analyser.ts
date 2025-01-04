import { Command, CommandMap } from './command';

/** Given a string input find the corresponding command. */
export class CommandAnalyser {
  /** Input split into single words - quoted parts will be taken as a single wod which still includes the quotes. */
  readonly words: string[];

  /**
   * Create a new analyser.
   *
   * @param cmd Input from the user.
   */
  constructor(cmd: string) {
    this.words = Array.from(this.split(cmd.toLowerCase()));
  }

  /**
   * Split some input into words.
   *
   * @param cmd Input from the user.
   */
  private *split(cmd: string) {
    /** Ignore leading and trailing whitespace. */
    cmd = cmd.trim();

    while (cmd) {
      /** Check for quote. */
      const quoted = cmd.startsWith('"');

      /** Find the appropriate end of the word - quote escaping is not supported. */
      let end = cmd.indexOf(quoted ? '"' : ' ', quoted ? 1 : 0);

      if (end < 0) end = cmd.length;
      else if (quoted) end++;

      /** Extract the word and report it. */
      yield cmd.substring(0, end);

      /** Remove word from input.  */
      cmd = cmd.substring(end).trim();
    }
  }

  /**
   * Analse the words we detected.
   *
   * @param map Root tree of the command declarations.
   * @param entities All entities which can be addressed by name.
   */
  *analyse(
    map: CommandMap,
    entities: Record<string, string>
  ): Generator<[string, string]> {
    /* May reference at least one thing or person. */
    let entity: string = null!;

    /* The command which will report. */
    let lastCommand: Command = null!;

    for (let i = 0; i < this.words.length; i++) {
      /* See if the word is part of the current command .*/
      const word = this.words[i];

      let command = map[word.startsWith('"') ? '*' : word];

      if (command) {
        /* Word recognized as part of the command tree. */
        lastCommand = command;
      } else if (entities[word] && !entity) {
        /* Word is a thing or person. */
        command = map['%'];

        if (command) {
          /* Explizit thing or persoen named in sentence. */
          lastCommand = map['%'];
          entity = entities[word];
        } else if (
          i === this.words.length - 1 &&
          lastCommand?.objectKeys.size
        ) {
          /* Thing or person at the very end. */
          command = lastCommand;
          entity = entities[word];
        }
      } else if ((command = map['*'])) {
        /** Rest of line. */
        i = this.words.length - 1;

        lastCommand = command;
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
        if (entity) for (const key of command.objectKeys) yield [key, entity];
        else for (const key of command.keys) yield [key, ''];

        break;
      }

      /* Dive int the command tree. */
      map = command.next;
    }
  }
}

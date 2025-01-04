import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssetService } from '../services/asset.service';
import { SettingsService } from '../services/settings.service';
import { CommandAnalyser } from './command-analyser';
import { CommandService } from './command.service';
import words from './test-commands';

describe('CommandService', () => {
  let service: CommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommandService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: { download: () => of(words) } },
      ],
    });
    service = TestBed.inject(CommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can parse file', () => {
    service.parse();

    expect(Object.keys(service.commands).length).toBe(10);
  });

  it('can split commands', () => {
    const test = (cmd: string, ...expected: string[]) => {
      const analyser = new CommandAnalyser(cmd);

      expect(analyser.words).toEqual(expected);
    };

    test('springe', 'springe');
    test('      springe       ', 'springe');
    test('springe ganz hoch', 'springe', 'ganz', 'hoch');
    test('sage "moin" zu peter', 'sage', '"moin"', 'zu', 'peter');
    test('sage "moin moin" zu peter', 'sage', '"moin moin"', 'zu', 'peter');

    test(
      'sage "moin" "moin" zu peter',
      'sage',
      '"moin"',
      '"moin"',
      'zu',
      'peter'
    );
  });

  it('can analyse commands without objects', () => {
    service.parse();

    const test = (cmd: string, ...keys: string[]) =>
      expect(Array.from(service.analyseCommand(cmd, {}))).toEqual(
        keys.map((k) => [k, ''])
      );

    test('springe', 'jump');
    test('schlafe');
    test('x y z');
    test('laufe nach vorne', 'go');
    test('nach vorne', 'go');
    test('vorwärts', 'go');
    test('GEHE Vorne', 'go');
    test('GEHE x Vorne', 'go');
    test('GEHE x Vorne y', 'go');
    test('GEHE x Vorne y z', 'go');
    test('x vorwärts', 'go');
  });

  it('can analyse commands with objects', () => {
    service.parse();

    const test = (cmd: string, ...keys: [string, string][]) =>
      expect(
        Array.from(service.analyseCommand(cmd, { geld: 'money' }))
      ).toEqual(keys);

    test('lege geld hin', ['drop', 'money']);
    test('nehme geld', ['take', 'money']);
  });
});

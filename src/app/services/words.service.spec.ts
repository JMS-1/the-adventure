import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssetService } from './asset.service';
import { CommandAnalyser } from './commandAnalyser';
import { SettingsService } from './settings.service';
import words from './words';
import { WordsService } from './words.service';

describe('WordsService', () => {
  let service: WordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WordsService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: { download: () => of(words) } },
      ],
    });
    service = TestBed.inject(WordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

    expect(Object.keys(service.commands).length).toBe(6);

    expect(Array.from(service.analyseCommand('springe'))).toEqual(['jump']);
    expect(Array.from(service.analyseCommand('schlafe'))).toEqual([]);
    expect(Array.from(service.analyseCommand('x y z'))).toEqual([]);

    expect(Array.from(service.analyseCommand('laufe nach vorne'))).toEqual([
      'go',
    ]);

    expect(Array.from(service.analyseCommand('nach vorne'))).toEqual(['go']);

    expect(Array.from(service.analyseCommand('vorwärts'))).toEqual(['go']);

    expect(Array.from(service.analyseCommand('GEHE Vorne'))).toEqual(['go']);

    expect(Array.from(service.analyseCommand('GEHE x Vorne'))).toEqual(['go']);

    expect(Array.from(service.analyseCommand('GEHE x Vorne y'))).toEqual([
      'go',
    ]);

    expect(Array.from(service.analyseCommand('GEHE x Vorne y z'))).toEqual([
      'go',
    ]);

    expect(Array.from(service.analyseCommand('x vorwärts'))).toEqual(['go']);
  });
});

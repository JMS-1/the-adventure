import { TestBed } from '@angular/core/testing';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';
import { WordsService } from './words.service';

describe('WordsService', () => {
  let service: WordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WordsService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(WordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';
import { StatesService } from './states.service';

describe('StatesService', () => {
  let service: StatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StatesService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(StatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

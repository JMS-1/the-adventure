import { TestBed } from '@angular/core/testing';

import { AssetService } from './asset.service';
import { InfoService } from './info.service';
import { SettingsService } from './settings.service';

describe('InfoService', () => {
  let service: InfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InfoService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(InfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

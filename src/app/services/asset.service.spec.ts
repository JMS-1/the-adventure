import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AssetService,
        { provide: HttpClient, useValue: {} },
        { provide: SettingsService, useValue: {} },
      ],
    });
    service = TestBed.inject(AssetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

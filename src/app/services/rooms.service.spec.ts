import { TestBed } from '@angular/core/testing';

import { AssetService } from './asset.service';
import { RoomsService } from './rooms.service';
import { SettingsService } from './settings.service';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoomsService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(RoomsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AssetService } from './asset.service';
import { DefaultsService } from './defaults.service';
import { SettingsService } from './settings.service';

describe('DefaultsService', () => {
  let service: DefaultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DefaultsService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(DefaultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { AssetService } from './asset.service';
import { ObjectsService } from './objects.service';
import { SettingsService } from './settings.service';

describe('ObjectsService', () => {
  let service: ObjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectsService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(ObjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

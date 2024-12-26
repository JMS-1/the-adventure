import { TestBed } from '@angular/core/testing';
import { AssetService } from './asset.service';
import { MessagesService } from './messages.service';
import { SettingsService } from './settings.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessagesService,
        { provide: SettingsService, useValue: {} },
        { provide: AssetService, useValue: {} },
      ],
    });
    service = TestBed.inject(MessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

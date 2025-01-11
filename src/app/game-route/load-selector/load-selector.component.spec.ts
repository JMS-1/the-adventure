import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSelectorComponent } from './load-selector.component';

describe('LoadSelectorComponent', () => {
  let component: LoadSelectorComponent;
  let fixture: ComponentFixture<LoadSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

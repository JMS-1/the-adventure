import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { WelcomeRouteComponent } from './welcome-route.component';

describe('WelcomeRouteComponent', () => {
  let component: WelcomeRouteComponent;
  let fixture: ComponentFixture<WelcomeRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeRouteComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

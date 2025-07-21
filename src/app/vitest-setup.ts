import 'zone.js';

import { ɵresolveComponentResources as resolver } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as testing from '@angular/platform-browser/testing';
import { afterEach, beforeAll } from 'vitest';

TestBed.initTestEnvironment(
  testing.BrowserTestingModule,
  testing.platformBrowserTesting()
);

beforeAll(() => resolver(fetch));

afterEach(() => TestBed.resetTestingModule());

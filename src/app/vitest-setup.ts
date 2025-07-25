import 'zone.js';

import { ɵresolveComponentResources } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import * as testing from '@angular/platform-browser/testing';
import { afterEach, beforeAll } from 'vitest';

const testBed = getTestBed();
const comp = testBed.compileComponents;

testBed.compileComponents = async () => {
  const res = await comp.apply(testBed);

  await ɵresolveComponentResources(fetch);

  return res;
};

TestBed.initTestEnvironment(
  testing.BrowserTestingModule,
  testing.platformBrowserTesting()
);

beforeAll(() => ɵresolveComponentResources(fetch));

afterEach(() => TestBed.resetTestingModule());

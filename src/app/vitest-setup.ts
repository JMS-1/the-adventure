import 'zone.js';

import { ɵresolveComponentResources } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import * as testing from '@angular/platform-browser/testing';
import { beforeAll } from 'vitest';

const testBed = getTestBed();
const comp = testBed.compileComponents;

const fetcher = (url: string) => fetch('/src/app/' + url);

testBed.compileComponents = async () => {
  const res = await comp.apply(testBed);

  await ɵresolveComponentResources(fetcher);

  return res;
};

TestBed.initTestEnvironment(
  testing.BrowserTestingModule,
  testing.platformBrowserTesting()
);

beforeAll(() => ɵresolveComponentResources(fetcher));

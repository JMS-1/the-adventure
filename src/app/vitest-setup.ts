import 'zone.js';

import { ɵresolveComponentResources } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import * as testing from '@angular/platform-browser/testing';
import { beforeAll } from 'vitest';
import { getTestScope, setupTestScope } from './testScope';

const testBed = getTestBed();
const comp = testBed.compileComponents;

const fetcher = (url: string) => {
  if (!url.startsWith('.')) return Promise.resolve('');

  const scope = getTestScope();

  if (!scope) return Promise.resolve('');

  return fetch(scope + url);
};

testBed.compileComponents = async () => {
  const res = await comp.apply(testBed);

  await ɵresolveComponentResources(fetcher);

  return res;
};

testBed.initTestEnvironment(
  testing.BrowserTestingModule,
  testing.platformBrowserTesting()
);

beforeAll(() => ɵresolveComponentResources(fetcher));

setupTestScope();

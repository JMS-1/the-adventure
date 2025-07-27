import 'zone.js';

import { ɵresolveComponentResources } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import * as testing from '@angular/platform-browser/testing';
import { beforeAll, RunnerTestSuite } from 'vitest';

let testScope: string | undefined;

const testBed = getTestBed();
const comp = testBed.compileComponents;

const fetcher = (url: string) => {
  if (!url.startsWith('.')) return Promise.resolve('');

  if (!testScope) return Promise.resolve('');

  return fetch(testScope + url);
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

beforeAll((ctx: RunnerTestSuite) => {
  testScope = '/' + ctx.name.substring(0, ctx.name.lastIndexOf('/') + 1);

  return ɵresolveComponentResources(fetcher);
});

afterAll(() => {
  testScope = undefined;
});

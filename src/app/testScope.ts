import { RunnerTestSuite } from 'vitest';

let testScope: string | undefined;

export function setupTestScope() {
  beforeAll((ctx: RunnerTestSuite) => {
    testScope = '/' + ctx.name.substring(0, ctx.name.lastIndexOf('/') + 1);
  });

  afterAll(() => {
    testScope = undefined;
  });
}

export function getTestScope() {
  return testScope;
}

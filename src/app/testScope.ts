let testScope: string | undefined;

export function setTestScope(scope: string) {
  testScope = undefined;

  if (!scope) return;

  const url = new URL(scope);
  const path = url.pathname;
  const root = path.indexOf('/src/app/');

  if (root >= 0) {
    testScope = path.substring(root);
    testScope = testScope.substring(0, testScope.lastIndexOf('/') + 1);
  }
}

export function getTestScope() {
  return testScope;
}

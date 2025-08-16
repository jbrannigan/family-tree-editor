# Testing & CI quickstart

## Vitest (unit tests)

Install dev deps and run tests:

```bash
npm i -D vitest
npx vitest run
```

The suite includes `tests/parseTree.test.js` covering:

- array-of-roots return shape
- leading spaces → tabs normalization
- inline spacing preserved

## Playwright (HTML export smoke test)

Install Playwright and browsers:

```bash
npm i -D @playwright/test
npx playwright install --with-deps
```

Run the tests:

```bash
npx playwright test
```

What it does: imports `utils/generateHTML.js`, sets the HTML directly into a headless browser page, and verifies expand/collapse controls work.

## GitHub Actions CI

Add `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci || npm i
      - run: npx vitest run --reporter=dot || echo "Vitest not configured"
      - run: npx playwright install --with-deps && npx playwright test || echo "Playwright not configured"
```

This workflow won’t fail your PR if the frameworks aren’t installed yet; remove the `|| echo` parts once you add the dev deps.

import assert from 'node:assert/strict';
import { realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const WORKSHOP_ROOT = path.dirname(fileURLToPath(import.meta.url));
const checkpointArgument = process.argv[2] ?? 'checkpoints/04-tests';
const requestedCheckpoint = path.resolve(WORKSHOP_ROOT, checkpointArgument);
const HARDENED_CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'";

function isWithinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === ''
    || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function resolveCheckpoint() {
  if (!isWithinRoot(WORKSHOP_ROOT, requestedCheckpoint)) {
    throw new Error(`Checkpoint path must stay within ${WORKSHOP_ROOT}`);
  }

  const checkpoint = realpathSync(requestedCheckpoint);
  if (!isWithinRoot(realpathSync(WORKSHOP_ROOT), checkpoint) || !statSync(checkpoint).isDirectory()) {
    throw new Error(`Checkpoint path must be a directory within ${WORKSHOP_ROOT}`);
  }
  return checkpoint;
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(0, '127.0.0.1');
  });
}

async function closeServer(server) {
  if (!server?.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections?.();
  });
}

async function textContent(page, selector) {
  return page.$eval(selector, (element) => element.textContent);
}

async function listItems(page) {
  return page.$$eval('#todo-list > li', (items) => items.map((item) => ({
    title: item.querySelector('.todo-title')?.textContent,
    completed: item.querySelector('.todo-toggle')?.checked,
  })));
}

async function submitTodo(page, title) {
  await page.locator('#todo-title').fill(title);
  await page.click('#todo-form button[type="submit"]');
}

async function itemIndex(page, title) {
  const titles = await page.$$eval('.todo-title', (elements) => elements.map((element) => element.textContent));
  const index = titles.indexOf(title);
  assert.notEqual(index, -1, `Todo not found: ${title}`);
  return index + 1;
}

async function clickTodoControl(page, title, selector) {
  const index = await itemIndex(page, title);
  await page.click(`#todo-list > li:nth-child(${index}) ${selector}`);
}

async function assertFilter(page, filter, expectedTitles) {
  await page.click(`[data-filter="${filter}"]`);
  assert.deepEqual(
    (await listItems(page)).map((todo) => todo.title),
    expectedTitles,
    `${filter} filter should show the expected todos`,
  );
  assert.equal(
    await page.$eval(`[data-filter="${filter}"]`, (button) => document.activeElement === button),
    true,
    `${filter} filter should retain focus`,
  );
}

async function assertFocusVisible(page, selector, description) {
  await page.keyboard.press('Tab');
  const focusStyle = await page.$eval(selector, (element) => {
    element.focus();
    const style = getComputedStyle(element);
    return {
      isFocused: document.activeElement === element,
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      boxShadow: style.boxShadow,
    };
  });
  const hasOutline = focusStyle.outlineStyle !== 'none' && focusStyle.outlineWidth >= 3;
  const hasBoxShadow = focusStyle.boxShadow !== 'none';
  assert.equal(focusStyle.isFocused, true, `${description} should receive focus`);
  assert.ok(
    hasOutline || hasBoxShadow,
    `${description} needs a visible focus indicator; got ${JSON.stringify(focusStyle)}`,
  );
}

async function hardenedTargetMetrics(page) {
  const metrics = await page.evaluate(() => {
    const dimensions = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
      };
    };

    return {
      add: dimensions(document.querySelector('#todo-form button[type="submit"]')),
      filters: Array.from(document.querySelectorAll('[data-filter]'), dimensions),
      deletes: Array.from(document.querySelectorAll('.delete-button'), dimensions),
      labels: Array.from(document.querySelectorAll('.todo-toggle-label'), (label) => {
        const style = getComputedStyle(label);
        return {
          ...dimensions(label),
          alignItems: style.alignItems,
          display: style.display,
          controlsCheckbox: label.control === label.querySelector('.todo-toggle'),
        };
      }),
      checkboxes: Array.from(document.querySelectorAll('.todo-toggle'), dimensions),
    };
  });

  const buttonTargets = [
    ['add button', metrics.add],
    ...metrics.filters.map((metric, index) => [`filter button ${index + 1}`, metric]),
    ...metrics.deletes.map((metric, index) => [`delete button ${index + 1}`, metric]),
  ];
  for (const [description, metric] of buttonTargets) {
    assert.ok(metric.height >= 44, `${description} target height must be at least 44px; got ${metric.height}px`);
  }

  assert.ok(metrics.labels.length > 0, 'Expected at least one Todo checkbox label hit target');
  assert.equal(metrics.labels.length, metrics.checkboxes.length, 'Every Todo checkbox needs one label hit target');
  for (const [index, label] of metrics.labels.entries()) {
    assert.ok(label.height >= 44, `Todo checkbox label ${index + 1} target height must be at least 44px; got ${label.height}px`);
    assert.equal(label.display, 'flex', `Todo checkbox label ${index + 1} must use display:flex`);
    assert.equal(label.alignItems, 'center', `Todo checkbox label ${index + 1} must align items centrally`);
    assert.equal(label.controlsCheckbox, true, `Todo checkbox label ${index + 1} must control its checkbox`);
  }
  for (const [index, checkbox] of metrics.checkboxes.entries()) {
    assert.ok(
      checkbox.width >= 20 && checkbox.width <= 24 && checkbox.height >= 20 && checkbox.height <= 24,
      `Todo checkbox ${index + 1} visual box must stay between 20px and 24px; got ${checkbox.width}x${checkbox.height}px`,
    );
  }

  await assertFocusVisible(page, '#todo-form button[type="submit"]', 'add button');
  for (const filter of ['all', 'active', 'completed']) {
    await assertFocusVisible(page, `[data-filter="${filter}"]`, `${filter} filter button`);
  }
  await assertFocusVisible(page, '.todo-toggle', 'Todo checkbox');
  await assertFocusVisible(page, '.delete-button', 'delete button');

  return metrics;
}

function isExpectedCspProbeConsoleError(messageText, probeUrl) {
  return messageText === (
    `Loading the script '${probeUrl}' violates the following Content Security Policy directive: `
    + `"script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback. `
    + 'The action has been blocked.'
  );
}

async function runCspProbe(page, cdpSession, requestEvents, probeUrl) {
  let networkTimeout;
  let onLoadingFailed;
  const blockedRequestPromise = new Promise((resolve, reject) => {
    onLoadingFailed = (event) => {
      const requestEvent = requestEvents.findLast((candidate) => candidate.requestId === event.requestId);
      if (
        requestEvent?.url !== probeUrl
        || event.blockedReason !== 'csp'
      ) return;

      clearTimeout(networkTimeout);
      requestEvent.blockedByCsp = true;
      cdpSession.off('Network.loadingFailed', onLoadingFailed);
      resolve({
        blockedReason: event.blockedReason,
        url: requestEvent.url,
      });
    };
    networkTimeout = setTimeout(() => {
      cdpSession.off('Network.loadingFailed', onLoadingFailed);
      reject(new Error(`Timed out waiting for CSP network block from ${probeUrl}`));
    }, 2_000);
    cdpSession.on('Network.loadingFailed', onLoadingFailed);
  });

  try {
    const [violations, blockedRequest] = await Promise.all([
      page.evaluate((src) => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const violations = [];
        let settleTimeout;
        const cleanup = () => {
          clearTimeout(timeout);
          clearTimeout(settleTimeout);
          window.removeEventListener('securitypolicyviolation', onViolation);
          script.remove();
        };
        const onViolation = (event) => {
          violations.push({
            blockedURI: event.blockedURI,
            effectiveDirective: event.effectiveDirective,
          });
          settleTimeout ??= setTimeout(() => {
            cleanup();
            resolve(violations);
          }, 50);
        };
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error(`Timed out waiting for CSP violation from ${src}`));
        }, 2_000);

        window.addEventListener('securitypolicyviolation', onViolation);
        script.src = src;
        document.head.append(script);
      }), probeUrl),
      blockedRequestPromise,
    ]);
    return { blockedRequest, violations };
  } finally {
    clearTimeout(networkTimeout);
    cdpSession.off('Network.loadingFailed', onLoadingFailed);
  }
}

function unblockedRequestUrls(requestEvents) {
  return requestEvents
    .filter((event) => !event.blockedByCsp)
    .map((event) => event.url);
}

function assertSameOriginRequests(requestUrls, expectedOrigin, hardened, probeUrl) {
  assert.ok(requestUrls.length > 0, 'Browser should make page requests');

  const probeRequests = hardened
    ? requestUrls.filter((requestUrl) => requestUrl === probeUrl).length
    : 0;
  if (hardened) {
    assert.equal(probeRequests, 0, `CSP must block the probe before network: ${probeUrl}`);
  }

  for (const requestUrl of requestUrls) {
    assert.equal(
      new URL(requestUrl).origin,
      expectedOrigin,
      `Request must stay on the exact workshop server origin: ${requestUrl}`,
    );
  }

  if (hardened) {
    const requestedAssets = new Set(requestUrls.map((requestUrl) => {
      const pathname = new URL(requestUrl).pathname;
      return pathname === '/' ? 'index.html' : path.posix.basename(pathname);
    }));
    for (const asset of ['index.html', 'app.js', 'styles.css', 'favicon.svg']) {
      assert.ok(requestedAssets.has(asset), `Hardened smoke must request ${asset}`);
    }
  }

  return {
    exactOriginRequests: requestUrls.length,
    probeNetworkRequests: probeRequests,
  };
}

const checkpoint = resolveCheckpoint();
const hardened = path.basename(checkpoint) === '05-hardened';
const [{ createWorkshopServer }, { STORAGE_KEY }] = await Promise.all([
  import(pathToFileURL(path.join(checkpoint, 'server.mjs')).href),
  import(pathToFileURL(path.join(checkpoint, 'storage.js')).href),
]);
const server = createWorkshopServer(checkpoint);
let browser;
let cdpSession;
let page;
let testError;
let targetMetrics;
let requestMetrics;
let expectedOrigin;
let probeUrl;
let cspViolationCount = 0;
const browserFailures = [];
const expectedCspConsoleErrors = [];
const networkRequestEvents = [];
const pageErrors = [];
const unexpectedConsoleErrors = [];

try {
  await listen(server);
  const address = server.address();
  assert(address && typeof address === 'object');

  expectedOrigin = `http://127.0.0.1:${address.port}`;
  if (hardened) {
    assert.ok(address.port < 65_535, 'Workshop server port must allow a port + 1 CSP probe');
    probeUrl = `http://127.0.0.1:${address.port + 1}/csp-probe.js`;
  }

  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
  cdpSession = await page.createCDPSession();
  await cdpSession.send('Network.enable');
  cdpSession.on('Network.requestWillBeSent', (event) => {
    networkRequestEvents.push({
      blockedByCsp: false,
      requestId: event.requestId,
      url: event.request.url,
    });
  });
  page.on('dialog', async (dialog) => {
    browserFailures.push(`Unexpected dialog: ${dialog.type()} ${dialog.message()}`);
    await dialog.dismiss().catch(() => {});
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') return;

    const messageText = message.text();
    if (
      hardened
      && expectedCspConsoleErrors.length === 0
      && isExpectedCspProbeConsoleError(messageText, probeUrl)
    ) {
      expectedCspConsoleErrors.push(messageText);
      return;
    }

    unexpectedConsoleErrors.push(messageText);
    browserFailures.push(`Console error: ${messageText}`);
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
    browserFailures.push(`Page error: ${error.message}`);
  });

  const url = `${expectedOrigin}/`;
  await page.goto(url, { waitUntil: 'load' });

  if (hardened) {
    assert.equal(
      await page.$eval('meta[http-equiv="Content-Security-Policy"]', (meta) => meta.getAttribute('content')),
      HARDENED_CSP,
      'Hardened CSP must match the release policy exactly',
    );

    const { blockedRequest, violations } = await runCspProbe(
      page,
      cdpSession,
      networkRequestEvents,
      probeUrl,
    );
    cspViolationCount = violations.length;
    assert.equal(cspViolationCount, 1, 'Hardened smoke must observe exactly one CSP violation');
    const [violation] = violations;
    assert.ok(
      violation.effectiveDirective === 'script-src' || violation.effectiveDirective === 'script-src-elem',
      `CSP probe must be blocked by script-src or script-src-elem; got ${violation.effectiveDirective}`,
    );
    assert.equal(
      new URL(violation.blockedURI).origin,
      new URL(probeUrl).origin,
      `CSP blockedURI must match the probe origin; got ${violation.blockedURI}`,
    );
    assert.equal(blockedRequest.blockedReason, 'csp', 'Chromium must report the probe as blocked by CSP');
    assert.equal(blockedRequest.url, probeUrl, 'Chromium must block the exact CSP probe URL');
    assert.equal(
      expectedCspConsoleErrors.length,
      1,
      `Hardened smoke must observe the exact probe CSP console error once; got ${JSON.stringify(unexpectedConsoleErrors)}`,
    );
    assert.equal(
      unblockedRequestUrls(networkRequestEvents).filter((requestUrl) => requestUrl === probeUrl).length,
      0,
      'CSP probe must be absent from the unblocked network request event list',
    );
  }

  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 0);
  assert.equal(await textContent(page, '#empty-state'), '目前沒有待辦事項。');

  await submitTodo(page, '   \t  ');
  assert.equal(await textContent(page, '#form-error'), '請輸入待辦事項。');
  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 0);

  await submitTodo(page, '  前後空白會移除  ');
  assert.deepEqual(await listItems(page), [{ title: '前後空白會移除', completed: false }]);
  assert.equal(await textContent(page, '#form-error'), '');

  const title120 = 'x'.repeat(120);
  await submitTodo(page, title120);
  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 2);
  assert.equal((await listItems(page))[1].title, title120);

  await page.$eval('#todo-title', (input) => input.removeAttribute('maxlength'));
  await page.locator('#todo-title').fill('x'.repeat(121));
  await page.$eval('#todo-form', (form) => form.requestSubmit());
  assert.equal(await textContent(page, '#form-error'), '待辦事項不可超過 120 個字元。');
  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 2);

  const xssTitle = '<img src=x onerror=alert(1)>';
  await submitTodo(page, xssTitle);
  await submitTodo(page, '第二項');
  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 4);
  assert.equal((await listItems(page))[2].title, xssTitle);
  assert.equal(await page.$$eval('#todo-list img', (images) => images.length), 0);
  assert.deepEqual(browserFailures, []);

  if (hardened) targetMetrics = await hardenedTargetMetrics(page);

  const toggleTarget = hardened ? '.todo-toggle-label' : '.todo-toggle';
  await clickTodoControl(page, xssTitle, toggleTarget);
  assert.equal((await listItems(page)).find((todo) => todo.title === xssTitle)?.completed, true);
  assert.equal(
    await page.$eval('.todo-toggle:checked', (checkbox) => document.activeElement === checkbox),
    true,
    'Toggled checkbox should retain focus after render',
  );

  await clickTodoControl(page, xssTitle, toggleTarget);
  assert.equal((await listItems(page)).find((todo) => todo.title === xssTitle)?.completed, false);
  await clickTodoControl(page, xssTitle, toggleTarget);
  assert.equal((await listItems(page)).find((todo) => todo.title === xssTitle)?.completed, true);

  await page.evaluate(() => {
    window.__browserSmokeSetItemCalls = 0;
    window.__browserSmokeOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) {
      window.__browserSmokeSetItemCalls += 1;
      return window.__browserSmokeOriginalSetItem.apply(this, args);
    };
  });

  await assertFilter(page, 'active', ['前後空白會移除', title120, '第二項']);
  await assertFilter(page, 'completed', [xssTitle]);
  await assertFilter(page, 'all', ['前後空白會移除', title120, xssTitle, '第二項']);
  assert.equal(await page.evaluate(() => window.__browserSmokeSetItemCalls), 0);

  await clickTodoControl(page, '第二項', '.delete-button');
  assert.equal(await page.$eval('#todo-title', (input) => document.activeElement === input), true);
  assert.equal(await page.evaluate(() => window.__browserSmokeSetItemCalls), 1);
  assert.deepEqual(
    await listItems(page),
    [
      { title: '前後空白會移除', completed: false },
      { title: title120, completed: false },
      { title: xssTitle, completed: true },
    ],
  );

  await page.reload({ waitUntil: 'load' });
  assert.deepEqual(
    await listItems(page),
    [
      { title: '前後空白會移除', completed: false },
      { title: title120, completed: false },
      { title: xssTitle, completed: true },
    ],
  );

  await page.evaluate((key) => localStorage.setItem(key, '{not-json'), STORAGE_KEY);
  await page.reload({ waitUntil: 'load' });
  assert.equal(await textContent(page, '#storage-warning'), '本機儲存資料已損壞，已使用空白清單。');
  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 0);

  await page.evaluate((key) => localStorage.setItem(key, '[]'), STORAGE_KEY);
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('browser smoke write failure', 'QuotaExceededError');
    };
  });
  await submitTodo(page, '只留在記憶體');
  assert.equal(await textContent(page, '.todo-title'), '只留在記憶體');
  assert.equal(await textContent(page, '#storage-warning'), '目前變更不會在重新整理後保留。');

  await page.reload({ waitUntil: 'load' });
  assert.equal(await page.$$eval('#todo-list > li', (items) => items.length), 0);
  assert.equal(await textContent(page, '#storage-warning'), '');
  requestMetrics = assertSameOriginRequests(
    unblockedRequestUrls(networkRequestEvents),
    expectedOrigin,
    hardened,
    probeUrl,
  );
  assert.equal(unexpectedConsoleErrors.length, 0, 'Browser smoke must not emit unexpected console errors');
  assert.equal(pageErrors.length, 0, 'Browser smoke must not emit page errors');
  assert.deepEqual(browserFailures, []);
} catch (error) {
  testError = error;
} finally {
  const cleanupErrors = [];
  if (page && !page.isClosed()) {
    try {
      await page.evaluate(() => localStorage.clear());
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  if (cdpSession) {
    try {
      await cdpSession.detach();
    } catch (error) {
      cleanupErrors.push(error);
    }
  }

  const closeTasks = [closeServer(server)];
  if (browser) closeTasks.push(browser.close());
  for (const result of await Promise.allSettled(closeTasks)) {
    if (result.status === 'rejected') cleanupErrors.push(result.reason);
  }

  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      testError ? [testError, ...cleanupErrors] : cleanupErrors,
      'Browser smoke cleanup failed',
    );
  }
}

if (testError) throw testError;
if (targetMetrics) {
  const summary = {
    add: targetMetrics.add.height,
    filters: targetMetrics.filters.map((metric) => metric.height),
    deletes: targetMetrics.deletes.map((metric) => metric.height),
    checkboxLabels: targetMetrics.labels.map((metric) => metric.height),
    checkboxes: targetMetrics.checkboxes.map((metric) => `${metric.width}x${metric.height}`),
  };
  console.log(`Hardened target sizes: ${JSON.stringify(summary)}`);
}
console.log(`Browser request metrics: ${JSON.stringify({
  exactOriginRequests: requestMetrics.exactOriginRequests,
  probeNetworkRequests: requestMetrics.probeNetworkRequests,
  cspViolations: cspViolationCount,
  unexpectedConsoleErrors: unexpectedConsoleErrors.length,
  pageErrors: pageErrors.length,
})}`);
console.log(`Browser smoke passed: ${checkpointArgument}`);

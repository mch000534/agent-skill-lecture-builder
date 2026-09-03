import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createWorkshopServer } from './server.mjs';

const HOME_HTML = '<h1>首頁</h1>';
const NESTED_HTML = '<h1>子目錄</h1>';
const STYLESHEET = 'body { color: #111; }';
const DIAGRAM = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

async function startServer(rootDirectory) {
  const server = createWorkshopServer(rootDirectory);
  await new Promise((resolve, reject) => {
    const handleError = (error) => reject(error);
    server.once('error', handleError);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', handleError);
      resolve();
    });
  });
  return server;
}

async function stopServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function fetchStatus(url) {
  const response = await fetch(url);
  await response.text();
  return response.status;
}

test('工作坊伺服器安全提供靜態檔案', async (t) => {
  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), 'vibe-workshop-'));
  const rootDirectory = path.join(fixtureDirectory, 'public');
  const disappearingFile = path.join(rootDirectory, 'disappearing.txt');
  const outsideFile = path.join(fixtureDirectory, 'outside.txt');
  let server;

  t.after(async () => {
    try {
      if (server?.listening) await stopServer(server);
    } finally {
      await rm(fixtureDirectory, { recursive: true, force: true });
    }
  });

  await mkdir(path.join(rootDirectory, 'nested'), { recursive: true });
  await Promise.all([
    writeFile(path.join(rootDirectory, 'index.html'), HOME_HTML),
    writeFile(path.join(rootDirectory, 'styles.css'), STYLESHEET),
    writeFile(path.join(rootDirectory, 'diagram.svg'), DIAGRAM),
    writeFile(path.join(rootDirectory, 'nested', 'index.html'), NESTED_HTML),
    writeFile(disappearingFile, '即將刪除'),
    writeFile(outsideFile, '不可讀取'),
  ]);

  server = await startServer(rootDirectory);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  await t.test('提供首頁內容、HTML MIME 與 nosniff', async () => {
    const response = await fetch(`${baseUrl}/`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(await response.text(), HOME_HTML);
  });

  await t.test('提供子目錄 index 內容', async () => {
    const response = await fetch(`${baseUrl}/nested/`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(await response.text(), NESTED_HTML);
  });

  await t.test('提供 CSS 內容與 MIME', async () => {
    const response = await fetch(`${baseUrl}/styles.css`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/css; charset=utf-8');
    assert.equal(await response.text(), STYLESHEET);
  });

  await t.test('提供 SVG 內容與 MIME', async () => {
    const response = await fetch(`${baseUrl}/diagram.svg`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/svg+xml');
    assert.equal(await response.text(), DIAGRAM);
  });

  await t.test('不存在的路徑回傳 404', async () => {
    assert.equal(await fetchStatus(`${baseUrl}/missing`), 404);
  });

  await t.test('無效 percent encoding 回傳 400', async () => {
    assert.equal(await fetchStatus(`${baseUrl}/%ZZ`), 400);
  });

  await t.test('encoded traversal 回傳 403', async () => {
    assert.equal(await fetchStatus(`${baseUrl}/..%2foutside.txt`), 403);
  });

  await t.test('symlink 回傳 403', async (symlinkTest) => {
    const insideLink = path.join(rootDirectory, 'linked-inside.html');
    const outsideLink = path.join(rootDirectory, 'linked-outside.txt');
    try {
      await symlink(path.join(rootDirectory, 'index.html'), insideLink);
      await symlink(outsideFile, outsideLink);
    } catch (error) {
      if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'ENOTSUP') {
        symlinkTest.skip('symlink creation unavailable');
        return;
      }
      throw error;
    }

    assert.equal(await fetchStatus(`${baseUrl}/linked-inside.html`), 403);
    assert.equal(await fetchStatus(`${baseUrl}/linked-outside.txt`), 403);
  });

  await t.test('request 前檔案被刪除時回傳 404 且 server 繼續服務', async () => {
    await unlink(disappearingFile);
    assert.equal(await fetchStatus(`${baseUrl}/disappearing.txt`), 404);

    const home = await fetch(`${baseUrl}/`);
    assert.equal(home.status, 200);
    assert.equal(await home.text(), HOME_HTML);
  });
});

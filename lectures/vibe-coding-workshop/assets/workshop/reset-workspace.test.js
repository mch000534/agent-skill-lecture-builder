const assert = require('node:assert/strict');
const {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');

const resetWorkspaceModule = import('./reset-workspace.mjs');

function createFixture(t) {
  const fixtureDirectory = mkdtempSync(path.join(tmpdir(), 'reset-workspace-'));
  t.after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));
  return fixtureDirectory;
}

function temporaryEntries(parent, destinationName) {
  return readdirSync(parent).filter((entry) => entry.startsWith(`.${destinationName}.tmp-${process.pid}`));
}

test('成功複製 checkpoint 到新目的地', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(path.join(checkpoint, 'nested'), { recursive: true });
  writeFileSync(path.join(checkpoint, 'nested', 'content.txt'), '完整內容');

  copyCheckpoint({ checkpoint, destination, copyImpl: cpSync });

  assert.equal(readFileSync(path.join(destination, 'nested', 'content.txt'), 'utf8'), '完整內容');
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('目的地已存在時拒絕且不變更原內容', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  mkdirSync(destination);
  writeFileSync(path.join(checkpoint, 'content.txt'), '新內容');
  writeFileSync(path.join(destination, 'content.txt'), '既有內容');
  let copyCalled = false;

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl() {
        copyCalled = true;
      },
    }),
    /Destination already exists/,
  );
  assert.equal(copyCalled, false);
  assert.equal(readFileSync(path.join(destination, 'content.txt'), 'utf8'), '既有內容');
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('來源不存在時不建立目的地或暫存半成品', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'missing-checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');

  assert.throws(
    () => copyCheckpoint({ checkpoint, destination, copyImpl: cpSync }),
    /Source does not exist/,
  );
  assert.equal(existsSync(destination), false);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('暫存複製後發生目的地建立競態時拒絕且完全不碰競爭者目錄', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  writeFileSync(path.join(checkpoint, 'content.txt'), '來源內容');

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl: cpSync,
      mkdirImpl(directory, options) {
        mkdirSync(destination);
        return mkdirSync(directory, options);
      },
    }),
    /Destination already exists/,
  );
  assert.equal(existsSync(destination), true);
  assert.deepEqual(readdirSync(destination), []);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('複製到暫存目錄失敗時不留下目的地或暫存半成品', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  writeFileSync(path.join(checkpoint, 'content.txt'), '來源內容');

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl(_source, temporaryDestination) {
        writeFileSync(path.join(temporaryDestination, 'partial.txt'), '半成品');
        throw new Error('simulated temporary copy failure');
      },
    }),
    /simulated temporary copy failure/,
  );
  assert.equal(existsSync(destination), false);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('目的地 identity 在複製失敗前被替換時保留競爭者目錄', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  writeFileSync(path.join(checkpoint, 'content.txt'), '來源內容');
  let copyCalls = 0;
  let originalIdentity;

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl(source, copyDestination, options) {
        copyCalls += 1;
        if (copyCalls === 1) {
          cpSync(source, copyDestination, options);
          return;
        }
        originalIdentity = lstatSync(destination);
        rmSync(destination, { recursive: true, force: true });
        mkdirSync(destination);
        writeFileSync(path.join(destination, 'competitor.txt'), '競爭者資料');
        throw new Error('simulated destination replacement');
      },
    }),
    /simulated destination replacement/,
  );
  assert.ok(originalIdentity);
  assert.equal(readFileSync(path.join(destination, 'competitor.txt'), 'utf8'), '競爭者資料');
  assert.deepEqual(readdirSync(destination), ['competitor.txt']);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('複製完成時目的地 identity 已被替換則失敗且保留競爭者目錄', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  writeFileSync(path.join(checkpoint, 'content.txt'), '來源內容');
  let copyCalls = 0;

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl(source, copyDestination, options) {
        copyCalls += 1;
        cpSync(source, copyDestination, options);
        if (copyCalls === 2) {
          rmSync(destination, { recursive: true, force: true });
          mkdirSync(destination);
          writeFileSync(path.join(destination, 'competitor.txt'), '競爭者資料');
        }
      },
    }),
    /Destination changed during copy/,
  );
  assert.equal(copyCalls, 2);
  assert.equal(readFileSync(path.join(destination, 'competitor.txt'), 'utf8'), '競爭者資料');
  assert.deepEqual(readdirSync(destination), ['competitor.txt']);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('複製失敗且目的地 identity 未變時清除本次建立的目錄與暫存半成品', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  writeFileSync(path.join(checkpoint, 'content.txt'), '來源內容');
  let copyCalls = 0;
  let originalIdentity;

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl(source, copyDestination, options) {
        copyCalls += 1;
        if (copyCalls === 1) {
          cpSync(source, copyDestination, options);
          return;
        }
        originalIdentity = lstatSync(destination);
        writeFileSync(path.join(copyDestination, 'partial.txt'), '半成品');
        throw new Error('simulated destination copy failure');
      },
    }),
    /simulated destination copy failure/,
  );
  assert.equal(copyCalls, 2);
  assert.ok(originalIdentity);
  assert.equal(existsSync(destination), false);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

test('目的地 cleanup 失敗時仍清除本次建立的唯一暫存目錄', async (t) => {
  const { copyCheckpoint } = await resetWorkspaceModule;
  const fixtureDirectory = createFixture(t);
  const checkpoint = path.join(fixtureDirectory, 'checkpoint');
  const destination = path.join(fixtureDirectory, 'workspace');
  mkdirSync(checkpoint);
  writeFileSync(path.join(checkpoint, 'content.txt'), '來源內容');
  let copyCalls = 0;

  assert.throws(
    () => copyCheckpoint({
      checkpoint,
      destination,
      copyImpl(source, copyDestination, options) {
        copyCalls += 1;
        if (copyCalls === 1) {
          cpSync(source, copyDestination, options);
          return;
        }
        throw new Error('simulated destination copy failure');
      },
      cleanupImpl(directory, options) {
        if (directory === destination) {
          throw new Error('simulated destination cleanup failure');
        }
        rmSync(directory, options);
      },
    }),
    /simulated destination cleanup failure/,
  );
  assert.equal(existsSync(destination), true);
  assert.deepEqual(temporaryEntries(fixtureDirectory, path.basename(destination)), []);
});

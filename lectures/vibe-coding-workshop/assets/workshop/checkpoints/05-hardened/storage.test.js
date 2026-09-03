import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTodos, saveTodos, STORAGE_KEY } from './storage.js';

const LOWER_ID = 'abcdefab-cdef-4abc-8abc-abcdefabcdef';
const UPPER_ID = LOWER_ID.toUpperCase();
const SECOND_ID = '22222222-2222-4222-8222-222222222222';

function makeTodo(overrides = {}) {
  return {
    id: LOWER_ID,
    title: '準備工作坊',
    completed: false,
    ...overrides,
  };
}

function createMemoryStorage({ initialValue = null, failRead = false, failWrite = false } = {}) {
  let value = initialValue;
  const setCalls = [];

  return {
    setCalls,
    getItem(key) {
      if (failRead) throw new Error('read failed');
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      setCalls.push([key, nextValue]);
      if (failWrite) throw new Error('write failed');
      value = nextValue;
    },
  };
}

test('loadTodos 對 missing key 回傳空清單且無警告', () => {
  const storage = createMemoryStorage();

  assert.deepEqual(loadTodos(storage), { todos: [], warning: null });
});

test('saveTodos 與 loadTodos 可完成有效資料 roundtrip', () => {
  const storage = createMemoryStorage();
  const todos = [makeTodo(), makeTodo({ id: SECOND_ID, title: '完成講義', completed: true })];

  assert.deepEqual(saveTodos(storage, todos), { ok: true });
  assert.deepEqual(storage.setCalls, [[STORAGE_KEY, JSON.stringify(todos)]]);
  assert.deepEqual(loadTodos(storage), { todos, warning: null });
});

test('loadTodos 對 storage 不存在或缺少 getItem 回傳 storage-unavailable', () => {
  for (const storage of [null, undefined, {}, { getItem: true }]) {
    assert.deepEqual(loadTodos(storage), {
      todos: [],
      warning: 'storage-unavailable',
    });
  }
});

test('loadTodos 隔離 getItem 拋錯並回傳 storage-unavailable', () => {
  const storage = createMemoryStorage({ failRead: true });

  assert.deepEqual(loadTodos(storage), {
    todos: [],
    warning: 'storage-unavailable',
  });
});

test('loadTodos 隔離 getItem property access 拋錯', () => {
  const storage = Object.defineProperty({}, 'getItem', {
    get() {
      throw new Error('property access failed');
    },
  });

  assert.deepEqual(loadTodos(storage), {
    todos: [],
    warning: 'storage-unavailable',
  });
});

test('loadTodos 拒絕 malformed JSON', () => {
  const storage = createMemoryStorage({ initialValue: '{not-json' });

  assert.deepEqual(loadTodos(storage), { todos: [], warning: 'corrupt-data' });
});

test('loadTodos 拒絕非陣列 JSON', () => {
  for (const value of [null, {}, 'todos', 1, true]) {
    const storage = createMemoryStorage({ initialValue: JSON.stringify(value) });
    assert.deepEqual(loadTodos(storage), { todos: [], warning: 'corrupt-data' });
  }
});

test('loadTodos 拒絕含額外或缺少 own enumerable 欄位的項目', () => {
  const invalidTodos = [
    { ...makeTodo(), note: '額外欄位' },
    { id: LOWER_ID, title: '缺少 completed' },
  ];

  for (const todo of invalidTodos) {
    const storage = createMemoryStorage({ initialValue: JSON.stringify([todo]) });
    assert.deepEqual(loadTodos(storage), { todos: [], warning: 'corrupt-data' });
  }
});

test('loadTodos 拒絕欄位型別錯誤', () => {
  const invalidTodos = [
    makeTodo({ id: 1 }),
    makeTodo({ title: null }),
    makeTodo({ completed: 0 }),
  ];

  for (const todo of invalidTodos) {
    const storage = createMemoryStorage({ initialValue: JSON.stringify([todo]) });
    assert.deepEqual(loadTodos(storage), { todos: [], warning: 'corrupt-data' });
  }
});

test('loadTodos 拒絕 invalid UUID 與 exact duplicate UUID', () => {
  const invalidLists = [
    [makeTodo({ id: 'not-a-uuid' })],
    [makeTodo(), makeTodo({ title: '重複識別碼' })],
  ];

  for (const todos of invalidLists) {
    const storage = createMemoryStorage({ initialValue: JSON.stringify(todos) });
    assert.deepEqual(loadTodos(storage), { todos: [], warning: 'corrupt-data' });
  }
});

test('loadTodos 拒絕未 trim、空白與 121 code units 的 title', () => {
  const invalidTitles = [' 未正規化', '   ', 'a'.repeat(121)];

  for (const title of invalidTitles) {
    const storage = createMemoryStorage({
      initialValue: JSON.stringify([makeTodo({ title })]),
    });
    assert.deepEqual(loadTodos(storage), { todos: [], warning: 'corrupt-data' });
  }
});

test('loadTodos 接受大小寫不同且 exact unique 的 UUID', () => {
  const todos = [makeTodo(), makeTodo({ id: UPPER_ID, title: '大寫識別碼' })];
  const storage = createMemoryStorage({ initialValue: JSON.stringify(todos) });

  assert.deepEqual(loadTodos(storage), { todos, warning: null });
});

test('saveTodos 對無效資料回傳 invalid-data 且不呼叫 setItem', () => {
  const storage = createMemoryStorage();
  const invalidLists = [
    null,
    [makeTodo({ title: '' })],
    [{ ...makeTodo(), note: '額外欄位' }],
    [makeTodo(), makeTodo({ title: '重複識別碼' })],
  ];

  for (const todos of invalidLists) {
    assert.deepEqual(saveTodos(storage, todos), { ok: false, error: 'invalid-data' });
  }
  assert.deepEqual(storage.setCalls, []);
});

test('saveTodos 隔離 JSON.stringify 的 toJSON property access 拋錯', () => {
  const storage = createMemoryStorage();
  const target = makeTodo();
  const todo = new Proxy(target, {
    ownKeys(value) {
      return Reflect.ownKeys(value);
    },
    getOwnPropertyDescriptor(value, property) {
      return Reflect.getOwnPropertyDescriptor(value, property);
    },
    get(value, property, receiver) {
      if (property === 'toJSON') throw new Error('toJSON failed');
      return Reflect.get(value, property, receiver);
    },
  });

  assert.deepEqual(Object.keys(todo), ['id', 'title', 'completed']);
  assert.throws(() => JSON.stringify([todo]), /toJSON failed/);
  assert.deepEqual(saveTodos(storage, [todo]), {
    ok: false,
    error: 'write-failed',
  });
  assert.equal(storage.setCalls.length, 0);
});

test('saveTodos 對 storage 不存在或缺少 setItem 回傳 write-failed', () => {
  const todos = [makeTodo()];

  for (const storage of [null, undefined, {}, { setItem: true }]) {
    assert.deepEqual(saveTodos(storage, todos), { ok: false, error: 'write-failed' });
  }
});

test('saveTodos 隔離 setItem 拋錯並回傳 write-failed', () => {
  const storage = createMemoryStorage({ failWrite: true });

  assert.deepEqual(saveTodos(storage, [makeTodo()]), {
    ok: false,
    error: 'write-failed',
  });
  assert.equal(storage.setCalls.length, 1);
});

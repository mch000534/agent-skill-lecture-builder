import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addTodo,
  deleteTodo,
  filterTodos,
  toggleTodo,
  validateTitle,
} from './todo.js';

const FIRST_ID = '11111111-1111-4111-8111-111111111111';
const SECOND_ID = '22222222-2222-4222-8222-222222222222';

function makeTodos() {
  return [
    { id: FIRST_ID, title: '第一件事', completed: false },
    { id: SECOND_ID, title: '第二件事', completed: true },
  ];
}

test('validateTitle 依序驗證型別、必填與 UTF-16 長度', () => {
  assert.deepEqual(validateTitle(null), { ok: false, error: 'invalid-type' });
  assert.deepEqual(validateTitle(42), { ok: false, error: 'invalid-type' });
  assert.deepEqual(validateTitle(' \n\t '), { ok: false, error: 'required' });
  assert.deepEqual(validateTitle('a'.repeat(121)), { ok: false, error: 'too-long' });
  assert.deepEqual(validateTitle(`  ${'a'.repeat(120)}  `), {
    ok: true,
    value: 'a'.repeat(120),
  });
});

test('addTodo 正規化標題並新增精確三欄位且不突變輸入', () => {
  const todos = makeTodos().slice(0, 1);
  const snapshot = structuredClone(todos);
  const result = addTodo(todos, '  新待辦  ', SECOND_ID);

  assert.deepEqual(result, {
    ok: true,
    todos: [
      snapshot[0],
      { id: SECOND_ID, title: '新待辦', completed: false },
    ],
    todo: { id: SECOND_ID, title: '新待辦', completed: false },
  });
  assert.deepEqual(todos, snapshot);
  assert.notStrictEqual(result.todos, todos);
  assert.strictEqual(result.todos[0], todos[0]);
  assert.strictEqual(result.todos[1], result.todo);
  assert.deepEqual(Object.keys(result.todo), ['id', 'title', 'completed']);
});

test('addTodo 對 null title 回傳 invalid-type 並保留輸入', () => {
  const todos = makeTodos();
  const snapshot = structuredClone(todos);
  const title = null;
  const result = addTodo(todos, title, 'abcdefab-cdef-4abc-8abc-abcdefabcdef');

  assert.deepEqual(result, { ok: false, todos, error: 'invalid-type' });
  assert.strictEqual(result.todos, todos);
  assert.strictEqual(title, null);
  assert.deepEqual(todos, snapshot);
});

test('addTodo 對空白 title 回傳 required 並保留輸入', () => {
  const todos = makeTodos();
  const snapshot = structuredClone(todos);
  const title = ' \n\t ';
  const result = addTodo(todos, title, 'abcdefab-cdef-4abc-8abc-abcdefabcdef');

  assert.deepEqual(result, { ok: false, todos, error: 'required' });
  assert.strictEqual(result.todos, todos);
  assert.strictEqual(title, ' \n\t ');
  assert.deepEqual(todos, snapshot);
});

test('addTodo 對 121 字元 title 回傳 too-long 並保留輸入', () => {
  const todos = makeTodos();
  const snapshot = structuredClone(todos);
  const title = 'a'.repeat(121);
  const result = addTodo(
    todos,
    title,
    'abcdefab-cdef-4abc-8abc-abcdefabcdef',
  );

  assert.deepEqual(result, { ok: false, todos, error: 'too-long' });
  assert.strictEqual(result.todos, todos);
  assert.strictEqual(title, 'a'.repeat(121));
  assert.deepEqual(todos, snapshot);
});

test('addTodo 接受大小寫 UUID 並以 exact case 判斷唯一性', () => {
  const lowerId = 'abcdefab-cdef-4abc-8abc-abcdefabcdef';
  const upperId = lowerId.toUpperCase();
  const todos = [{ id: lowerId, title: '小寫 ID', completed: false }];
  const snapshot = structuredClone(todos);
  const added = addTodo(todos, '大寫 ID', upperId);

  assert.equal(added.ok, true);
  assert.strictEqual(added.todo.id, upperId);
  assert.strictEqual(added.todos[1].id, upperId);
  assert.deepEqual(todos, snapshot);

  const duplicate = addTodo(added.todos, '重複大寫 ID', upperId);
  assert.deepEqual(duplicate, {
    ok: false,
    todos: added.todos,
    error: 'duplicate-id',
  });
  assert.strictEqual(duplicate.todos, added.todos);
});

test('addTodo 對無效與重複 ID 回傳字串錯誤並保留原陣列', () => {
  const todos = makeTodos();
  const invalid = addTodo(todos, '新待辦', 'not-a-uuid');
  const duplicate = addTodo(todos, '新待辦', FIRST_ID);

  assert.deepEqual(invalid, { ok: false, todos, error: 'invalid-id' });
  assert.deepEqual(duplicate, { ok: false, todos, error: 'duplicate-id' });
  assert.strictEqual(invalid.todos, todos);
  assert.strictEqual(duplicate.todos, todos);
});

test('toggleTodo 只複製並反轉精確匹配項目', () => {
  const todos = makeTodos();
  const snapshot = structuredClone(todos);
  const result = toggleTodo(todos, FIRST_ID);

  assert.equal(result.changed, true);
  assert.notStrictEqual(result.todos, todos);
  assert.notStrictEqual(result.todos[0], todos[0]);
  assert.strictEqual(result.todos[1], todos[1]);
  assert.deepEqual(result.todos[0], { ...todos[0], completed: true });
  assert.deepEqual(todos, snapshot);
});

test('toggleTodo 對大寫 UUID 採 exact match 且小寫不匹配', () => {
  const upperId = 'ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF';
  const lowerId = upperId.toLowerCase();
  const todos = [{ id: upperId, title: '大寫 ID', completed: false }];

  const wrongCase = toggleTodo(todos, lowerId);
  assert.deepEqual(wrongCase, { todos, changed: false });
  assert.strictEqual(wrongCase.todos, todos);

  const exactCase = toggleTodo(todos, upperId);
  assert.deepEqual(exactCase, {
    todos: [{ id: upperId, title: '大寫 ID', completed: true }],
    changed: true,
  });
  assert.notStrictEqual(exactCase.todos, todos);
  assert.equal(todos[0].completed, false);
});

test('toggleTodo 對非法或不存在 ID 不變更', () => {
  const todos = makeTodos().slice(0, 1);
  const ids = [null, '', '   ', 'not-a-uuid', SECOND_ID];

  for (const id of ids) {
    const result = toggleTodo(todos, id);
    assert.deepEqual(result, { todos, changed: false });
    assert.strictEqual(result.todos, todos);
  }
});

test('deleteTodo 精確移除匹配項目且不突變輸入', () => {
  const todos = makeTodos();
  const snapshot = structuredClone(todos);
  const result = deleteTodo(todos, FIRST_ID);

  assert.deepEqual(result, { todos: [todos[1]], changed: true });
  assert.notStrictEqual(result.todos, todos);
  assert.strictEqual(result.todos[0], todos[1]);
  assert.deepEqual(todos, snapshot);
});

test('deleteTodo 對大寫 UUID 採 exact match 且小寫不匹配', () => {
  const upperId = 'ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF';
  const lowerId = upperId.toLowerCase();
  const todos = [{ id: upperId, title: '大寫 ID', completed: false }];

  const wrongCase = deleteTodo(todos, lowerId);
  assert.deepEqual(wrongCase, { todos, changed: false });
  assert.strictEqual(wrongCase.todos, todos);

  const exactCase = deleteTodo(todos, upperId);
  assert.deepEqual(exactCase, { todos: [], changed: true });
  assert.notStrictEqual(exactCase.todos, todos);
  assert.equal(todos.length, 1);
});

test('deleteTodo 對非法或不存在 ID 不變更', () => {
  const todos = makeTodos().slice(0, 1);
  const ids = [undefined, '', '   ', 'invalid', SECOND_ID];

  for (const id of ids) {
    const result = deleteTodo(todos, id);
    assert.deepEqual(result, { todos, changed: false });
    assert.strictEqual(result.todos, todos);
  }
});

test('filterTodos 三種合法篩選都回傳新陣列並保留物件', () => {
  const todos = makeTodos();
  const all = filterTodos(todos, 'all');
  const active = filterTodos(todos, 'active');
  const completed = filterTodos(todos, 'completed');

  assert.deepEqual(all, todos);
  assert.deepEqual(active, [todos[0]]);
  assert.deepEqual(completed, [todos[1]]);
  assert.notStrictEqual(all, todos);
  assert.notStrictEqual(active, todos);
  assert.notStrictEqual(completed, todos);
  assert.strictEqual(all[0], todos[0]);
  assert.strictEqual(active[0], todos[0]);
  assert.strictEqual(completed[0], todos[1]);
});

test('filterTodos 對非法篩選拋出 TypeError', () => {
  assert.throws(() => filterTodos(makeTodos(), 'unknown'), TypeError);
  assert.throws(() => filterTodos(makeTodos(), null), TypeError);
});

export const STORAGE_KEY = 'vibe-coding.todos.v1';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TODO_KEYS = ['completed', 'id', 'title'];

function isValidTodo(todo) {
  if (typeof todo !== 'object' || todo === null || Array.isArray(todo)) {
    return false;
  }

  const keys = Object.keys(todo).sort();
  if (keys.length !== TODO_KEYS.length || keys.some((key, index) => key !== TODO_KEYS[index])) {
    return false;
  }

  return typeof todo.id === 'string'
    && UUID_V4_PATTERN.test(todo.id)
    && typeof todo.title === 'string'
    && todo.title === todo.title.trim()
    && todo.title.length >= 1
    && todo.title.length <= 120
    && typeof todo.completed === 'boolean';
}

function isValidTodoList(todos) {
  if (!Array.isArray(todos)) return false;

  try {
    const ids = new Set();
    for (const todo of todos) {
      if (!isValidTodo(todo) || ids.has(todo.id)) return false;
      ids.add(todo.id);
    }
    return true;
  } catch {
    return false;
  }
}

export function loadTodos(storage) {
  let storedValue;
  try {
    if (typeof storage?.getItem !== 'function') {
      return { todos: [], warning: 'storage-unavailable' };
    }
    storedValue = storage.getItem(STORAGE_KEY);
  } catch {
    return { todos: [], warning: 'storage-unavailable' };
  }

  if (storedValue === null) {
    return { todos: [], warning: null };
  }

  try {
    const todos = JSON.parse(storedValue);
    if (!isValidTodoList(todos)) {
      return { todos: [], warning: 'corrupt-data' };
    }
    return { todos, warning: null };
  } catch {
    return { todos: [], warning: 'corrupt-data' };
  }
}

export function saveTodos(storage, todos) {
  if (!isValidTodoList(todos)) {
    return { ok: false, error: 'invalid-data' };
  }

  try {
    if (typeof storage?.setItem !== 'function') {
      return { ok: false, error: 'write-failed' };
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return { ok: true };
  } catch {
    return { ok: false, error: 'write-failed' };
  }
}

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidId(id) {
  return typeof id === 'string' && UUID_V4_PATTERN.test(id);
}

export function validateTitle(input) {
  if (typeof input !== 'string') {
    return { ok: false, error: 'invalid-type' };
  }

  const value = input.trim();
  if (value.length === 0) {
    return { ok: false, error: 'required' };
  }
  if (value.length > 120) {
    return { ok: false, error: 'too-long' };
  }

  return { ok: true, value };
}

export function addTodo(todos, rawTitle, id) {
  const titleResult = validateTitle(rawTitle);
  if (!titleResult.ok) {
    return { ok: false, todos, error: titleResult.error };
  }
  if (!isValidId(id)) {
    return { ok: false, todos, error: 'invalid-id' };
  }
  if (todos.some((todo) => todo.id === id)) {
    return { ok: false, todos, error: 'duplicate-id' };
  }

  const todo = { id, title: titleResult.value, completed: false };
  return { ok: true, todos: [...todos, todo], todo };
}

export function toggleTodo(todos, id) {
  if (!isValidId(id)) {
    return { todos, changed: false };
  }

  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return { todos, changed: false };
  }

  const nextTodos = todos.slice();
  nextTodos[index] = { ...todos[index], completed: !todos[index].completed };
  return { todos: nextTodos, changed: true };
}

export function deleteTodo(todos, id) {
  if (!isValidId(id)) {
    return { todos, changed: false };
  }

  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return { todos, changed: false };
  }

  return {
    todos: [...todos.slice(0, index), ...todos.slice(index + 1)],
    changed: true,
  };
}

export function filterTodos(todos, filter) {
  if (filter === 'all') {
    return todos.slice();
  }
  if (filter === 'active') {
    return todos.filter((todo) => todo.completed === false);
  }
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed === true);
  }

  throw new TypeError('不支援的篩選條件');
}

import { loadTodos, saveTodos } from './storage.js';
import { addTodo, deleteTodo, filterTodos, toggleTodo } from './todo.js';

const form = document.querySelector('#todo-form');
const titleInput = document.querySelector('#todo-title');
const formError = document.querySelector('#form-error');
const storageWarning = document.querySelector('#storage-warning');
const todoList = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

const errorMessages = {
  'invalid-type': '待辦事項格式不正確。',
  required: '請輸入待辦事項。',
  'too-long': '待辦事項不可超過 120 個字元。',
  'invalid-id': '無法建立待辦事項，請再試一次。',
  'duplicate-id': '無法建立待辦事項，請再試一次。',
};

const storageWarningMessages = {
  'storage-unavailable': '無法讀取本機儲存空間，已使用空白清單。',
  'corrupt-data': '本機儲存資料已損壞，已使用空白清單。',
};

let storage = null;
try {
  storage = window.localStorage;
} catch {
  storage = null;
}

const loaded = loadTodos(storage);
let todos = loaded.todos;
let currentFilter = 'all';
let visibleTodoControls = new Map();
storageWarning.textContent = loaded.warning === null
  ? ''
  : storageWarningMessages[loaded.warning];

function saveCurrentTodos() {
  const result = saveTodos(storage, todos);
  storageWarning.textContent = result.ok
    ? ''
    : '目前變更不會在重新整理後保留。';
}

function render() {
  const visibleTodos = filterTodos(todos, currentFilter);
  const nextVisibleTodoControls = new Map();
  const items = visibleTodos.map((todo) => {
    const item = document.createElement('li');
    item.className = 'todo-item';

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-toggle';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `切換「${todo.title}」完成狀態`);
    checkbox.addEventListener('change', () => {
      const result = toggleTodo(todos, todo.id);
      if (result.changed) {
        todos = result.todos;
        saveCurrentTodos();
        render();

        const controls = visibleTodoControls.get(todo.id);
        if (controls) {
          controls.checkbox.focus();
        } else {
          filterButtons.find((button) => button.dataset.filter === currentFilter)?.focus();
        }
      }
    });

    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'todo-toggle-label';
    checkboxLabel.append(checkbox);

    const title = document.createElement('span');
    title.className = todo.completed ? 'todo-title completed' : 'todo-title';
    title.textContent = todo.title;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.title}」`);
    deleteButton.addEventListener('click', () => {
      const result = deleteTodo(todos, todo.id);
      if (result.changed) {
        todos = result.todos;
        saveCurrentTodos();
        render();
        titleInput.focus();
      }
    });

    nextVisibleTodoControls.set(todo.id, { checkbox, deleteButton });
    item.append(checkboxLabel, title, deleteButton);
    return item;
  });

  todoList.replaceChildren(...items);
  visibleTodoControls = nextVisibleTodoControls;
  emptyState.hidden = visibleTodos.length !== 0;
  emptyState.textContent = todos.length === 0
    ? '目前沒有待辦事項。'
    : '目前沒有符合篩選條件的待辦事項。';

  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = addTodo(todos, titleInput.value, crypto.randomUUID());

  if (!result.ok) {
    formError.textContent = errorMessages[result.error];
    return;
  }

  todos = result.todos;
  saveCurrentTodos();
  titleInput.value = '';
  formError.textContent = '';
  render();
  titleInput.focus();
});

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    render();
  });
}

render();

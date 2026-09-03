const form = document.querySelector('#todo-form');
const formError = document.querySelector('#form-error');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.textContent = '請先完成需求與規格。';
});

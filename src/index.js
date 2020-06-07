import startPageRender from '../index.hbs';
import loginFormRender from './templates/login-form.hbs';
import chatFormRender from './templates/chat-form.hbs';


function chatInit() {
  const container = document.querySelector('.container');
  container.innerHTML = loginFormRender ({});
}

console.log("Что-то получается");

chatInit();

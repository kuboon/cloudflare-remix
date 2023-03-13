import { register, login } from './_includes/js/webauthn.client.js';
function onRegister() {
  const username = (document.getElementById('username')).value
  register(username).then(() => location.href = '/my').catch(alert);
}
function onLogin() {
  const username = (document.getElementById('username')).value
  login(username).then(() => location.href = '/my').catch(alert);
}
document.getElementById('button-register').addEventListener('click', onRegister);
document.getElementById('button-login').addEventListener('click', onLogin);

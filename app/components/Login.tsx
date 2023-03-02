import { register, login } from './webauthn.client.js';
import { ClientOnly, useHydrated } from "remix-utils";

function onRegister() {
  const username = (document.getElementById('username') as HTMLInputElement).value
  register(username).then(() => location.href = '/my').catch(alert);
}
function onLogin() {
  const username = (document.getElementById('username') as HTMLInputElement).value
  login(username).then(() => location.href = '/my').catch(alert);
}
export function Login() {
  const hydrated = useHydrated();
  return <>
    <div className="right-column fl">
      <h2><i className="fas fa-user-ninja"></i>&nbsp;Enter username</h2>
      <input type="text" className="full" id="username" maxLength={25} disabled={!hydrated} />
      <button className="button-primary fl half" id="button-register" onClick={onRegister}>Register</button>
      <button className="button-primary fl half" id="button-login" onClick={onLogin}>Login</button>
    </div>
  </>
}

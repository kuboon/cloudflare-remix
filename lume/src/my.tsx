import { render } from 'npm:preact';

function logout() {
  fetch('/session', { method: 'DELETE' }).then(() => {
    location.reload();
  })
}

const App = (session) => {
  return <>
    <p>{session.userName}</p>
    <button onClick={logout}>Logout</button>
  </>;
}
document.addEventListener('DOMContentLoaded', async () => {
  const session = await fetch('/session').then(r => r.json());
  render(App(session), document.getElementById('app'));
})

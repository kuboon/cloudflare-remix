import { Login } from '~/components/Login';
import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <Link to="/shared/1">Shared Page</Link>
      <Login />
    </div>
  );
}

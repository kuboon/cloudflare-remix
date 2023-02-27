import { Login } from '~/components/Login';
import { ClientOnly, useHydrated } from "remix-utils";
import { Link } from '@remix-run/react';

export default function Index() {
  const hydrated = useHydrated();
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <Link to="/shared/1">Shared Page</Link>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Login />}
      </ClientOnly>
    </div>
  );
}

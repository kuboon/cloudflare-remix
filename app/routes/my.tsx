import type { ActionArgs, LoaderArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { database } from "~/db/mod";
import { destroySession, getSession } from "~/sessions";

export async function loader({ context, request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  if (!session.get('loggedIn'))
    throw new Response(`<head><meta http-equiv="Refresh" content="0; URL=/" /></head>`, { status: 401, headers: { 'Content-Type': 'text/html' } })
  const username = session.get('username')
  const db = new database(context.DB as any)
  const user = await db.getUser(username)
  if (!user)
    throw new Response(`<head><meta http-equiv="Refresh" content="0; URL=/" /></head>`, { status: 401, headers: { 'Content-Type': 'text/html' } })
  return { user }
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  return redirect('/', { headers: { 'Set-Cookie': await destroySession(session) } })
}

export default function Page() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{user?.userName}</h1>
      <p>Logged in</p>
      <Form method="post"><button>Logout</button></Form>
    </div>
  );
}

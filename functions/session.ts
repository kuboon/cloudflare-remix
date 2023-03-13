import { database } from "./_lib/db/mod.js";
import { destroySession, getSession } from "./_lib/sessions.js";

interface Env {
  DB: D1Database;
}

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
    ...init,
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const store = {
    session: await getSession(request.headers.get("Cookie")),
    db: new database(env.DB),
  }
  const username = store.session.get("username")
  if(!username) return new Response(null, { status: 401 })
  const user = await store.db.getUser(store.session.get("username"))
  return json(user)
}

export const onRequestDelete: PagesFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"))
  return new Response(null, { status: 204, headers: { "Set-Cookie": await destroySession(session) } })
}

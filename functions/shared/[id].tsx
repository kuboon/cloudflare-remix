import { database } from "../_lib/db/mod";

type Item = { title: string, content: string }
const imgUrl = (item: Item) => `/og_img?title=${item.title}&content=${item.content}`

const meta = (item) => {
  return [
    {
      title: item.title,
    },
    {
      name: "description",
      content: item.content,
    },
    {
      property: "og:image",
      content: imgUrl(item),
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@remix_run' },
    { name: 'twitter:creator', content: '@remix_run' },
  ];
};

interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const db = new database(env.DB)
  const id = request.url.split("/").pop()
  const user = await db.getUser(id)
  const item = {
    title: user.userName,
    content: `content of ${user.userName}`,
  }
  return new Response(`
    <div>
      <h1>Shared Page</h1>
      <img src="${imgUrl(item)}" />
    </div>
  `, { headers: { "content-type": "text/html" } });
}

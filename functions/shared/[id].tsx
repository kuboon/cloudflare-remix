import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { database } from "../_lib/db/mod.js";

function jsx(jsx: React.ReactElement) {
  return new Response(renderToStaticMarkup(jsx), { headers: { "content-type": "text/html" } })
}

type Item = { title: string, content: string }
type MetaAttrs = Record<string, string>
const imgUrl = (item: Item) => `/og_img?title=${item.title}&content=${item.content}`

const metasFromItem: (Item) => MetaAttrs[] = (item) => {
  return [
    { name: "description", content: item.content, },
    { property: "og:title", content: item.title },
    { property: "og:image", content: imgUrl(item) },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '' },
    { name: 'twitter:creator', content: '' },
  ];
};

interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

const Metas = (metas: MetaAttrs[]) => {
  return metas.map((m) => <meta {...m} />)
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const db = new database(env.DB)
  const id = request.url.split("/").pop()
  const user = await db.getUser(id)
  const item = {
    title: user.userName,
    content: `content of ${user.userName}`,
  }
  return jsx(
    <>
      <head>
        <title>{item.title}</title>
        {Metas(metasFromItem(item))}
      </head>
      <div>
        <h1>Shared Page</h1>
        <img src={imgUrl(item)} />
      </div>
    </>
  )
}

type Item = { title: string, content: string }
function getItem(id: string) {
  return { id, title: `this is title ${id}`, content: `this is content ${id}` }
}
const imgUrl = (item: Item) => `/og_img?title=${item.title}&content=${item.content}`

async function loader({ params }) {
  return { item: await getItem(params.id!) };
}

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
	KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async ({request}) => {
  const { item } = await loader({ params: { id: request.url.split("/").pop() } })
  return new Response(`
    <div>
      <h1>Shared Page</h1>
      <img src="${imgUrl(item)}" />
    </div>
  `, {headers: {"content-type": "text/html"}});
}

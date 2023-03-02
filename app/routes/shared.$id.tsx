import type { LoaderArgs, V2_MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

type Item = { title: string, content: string }
function getItem(id: string) {
  return { id, title: `this is title ${id}`, content: `this is content ${id}` }
}
const imgUrl = (item: Item) => `/og_img?title=${item.title}&content=${item.content}`

export async function loader({ params }: LoaderArgs) {
  return { item: await getItem(params.id!) };
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const { item } = data
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

export default function Page() {
  const { item } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Shared Page</h1>
      <img src={imgUrl(item)} />
    </div>
  );
}

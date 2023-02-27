import type { LoaderArgs, V2_MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

function getItem(id: string){
  return { id, msg: 'message' }
}
export async function loader({ params }: LoaderArgs) {
  return json({
    item: await getItem(params.id!),
  });
}

export const meta: V2_MetaFunction<typeof loader> = ({data}) => {
  return [
    {
      title: "New Remix App",
    },
    {
      name: "description",
      content: "This app is a wildly dynamic web app",
    },
    {
      property: "og:image",
      content: `/og_img?msg=${data.item.msg}`,
    }
  ];
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Shared Page</h1>
      <img src={`/og_img?msg=${data.item.msg}`} />
    </div>
  );
}

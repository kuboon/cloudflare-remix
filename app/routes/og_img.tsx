import type { LoaderArgs } from "@remix-run/cloudflare";
import { generateImage } from "~/lib/img";

interface Props {
  title: string;
  content: string;
}
const OgImage = ({
  title,
  content
}: Props) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'pink',
      }}
    >
      <div
        style={{
          fontSize: '64px',
          color: 'filter: invert(100%) grayscale(100%) contrast(100)',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: '32px', color: 'gray' }}>
        {content}
      </div>
    </div>
  );
};

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title")!;
  const content = url.searchParams.get("content")!;
  const img = await generateImage(<OgImage title={title} content={content} />);
  const headers = {
    'Content-Type': 'image/png',
    'Cache-Control': 'max-age=604800',
  }
  return new Response(img, { headers });
}

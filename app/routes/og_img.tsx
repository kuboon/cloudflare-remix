import type { LoaderArgs } from "@remix-run/cloudflare";
import { generateImage } from "~/lib/img";

interface Props {
  msg: string;
  from?: string;
  to?: string;
}
const OgImage = ({
  msg,
  from = 'rgba(25,152,97,1)',
  to = 'rgba(0,93,255,1)',
}: Props) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(45deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <span
        style={{
          fontSize: '64px',
          color: 'filter: invert(100%) grayscale(100%) contrast(100)',
        }}
      >
        {msg}
      </span>
    </div>
  );
};

export async function loader({ request, context }: LoaderArgs) {
  const url = new URL(request.url);
  const msg = url.searchParams.get("msg") || 'hello';
  const img = await generateImage(<OgImage msg={msg} />);
  // c.header('Cache-Control', 'max-age=604800');
  return new Response(img, { headers: { 'Content-Type': 'image/png' } });
}

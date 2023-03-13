import { ImageResponse } from "workers-og";
import type { ReactElement } from 'react';
import * as React from 'react';
export async function loadGoogleFont({
  family,
  weight,
  text,
}: {
  family: string;
  weight?: number;
  text?: string;
}) {
  const params: Record<string, string> = {
    family: `${encodeURIComponent(family)}${weight ? `:wght@${weight}` : ''}`,
  };

  if (text) {
    params.text = text;
  } else {
    params.subset = 'latin';
  }

  const url = `https://fonts.googleapis.com/css2?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')}`;

  const css = await fetch(`${url}`, {
    headers: {
      // construct user agent to get TTF font
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  }).then((res) => res.text());

  // Get the font URL from the CSS text
  const fontUrl = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  )?.[1];

  if (!fontUrl) {
    throw new Error('Could not find font URL');
  }

  return fetch(fontUrl).then((res) => res.arrayBuffer());
}

export const generateImage = async (node: ReactElement) => {
  const notoSans = await loadGoogleFont({
    family: 'Noto Sans JP',
    weight: 100,
  });

  return new ImageResponse(node as any, {
    width: 1200,
    height: 630,
    debug: true,
    fonts: [
      {
        name: 'NotoSansJP',
        data: notoSans,
        weight: 100,
        style: 'normal',
      },
    ],
  });
};

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
        width: '100vw',
        height: '100vh',
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

interface Env {
	KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async ({request}) => {
  const url = new URL(request.url);
  const title = url.searchParams.get("title")!;
  const content = url.searchParams.get("content")!;
  return generateImage(<OgImage title={title} content={content} />);
}

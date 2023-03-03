// @ts-ignore
import { ImageResponse } from "workers-og";
import type { ReactElement } from 'react';
import { loadGoogleFont } from './fonts';

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

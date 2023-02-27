// @ts-ignore
import satori, { init as initSatori } from 'satori/wasm';
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm as initResvg } from '@resvg/resvg-wasm';
import type { ReactNode } from 'react';
import { loadGoogleFont } from './fonts';

const genModuleInit = async () => Promise.all([
  fetch('https://unpkg.com/yoga-wasm-web/dist/yoga.wasm').then(x=>x.arrayBuffer()).then(initYoga).then(initSatori),
  fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm').then(x=>x.arrayBuffer()).then(initResvg)
])
const moduleInit = genModuleInit();

export const generateImage = async (node: ReactNode) => {
  await moduleInit;
  const notoSans = await loadGoogleFont({
    family: 'Noto Sans JP',
    weight: 100,
  });

  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'NotoSansJP',
        data: notoSans,
        weight: 100,
        style: 'thin',
      },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return pngBuffer;
};

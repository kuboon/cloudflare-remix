# Cloudflare Pages Functions + deno lume
`/functions` 以下が cloudflare pages functions で、 wrangler が直接 js/ts を実行する。
ts を使うと wasm を読めないので、 `og_img` は esbuild する。

https://lume.land/
`/lume` 以下で `deno task build` すると `/public` 以下に静的ファイル群が生成される。

# setup
```
npm i
npm run db:create # 指示通りに wrangler.toml に d1_database を追加
npm run db:setup

```

## Development

You will be utilizing Wrangler for local development to emulate the Cloudflare runtime. This is already wired up in your package.json as the `dev` script:

```sh
npm run dev
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go!

## Deployment

Cloudflare Pages are currently only deployable through their Git provider integrations.

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages) and after verifying your email address with Cloudflare, go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything).

Configure the "Build command" should be set to `npm run build`, and the "Build output directory" should be set to `public`.

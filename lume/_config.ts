import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import jsx_preact from "lume/plugins/jsx_preact.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import metas from "lume/plugins/metas.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import postcss from "lume/plugins/postcss.ts"
import sitemap from "lume/plugins/sitemap.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";

const site = lume({
  src: './src',
  dest: '../public'
});
site.copy('static', '/')
site.copy('static/_headers', '/')
site.copy('static/_routes.json', '/')

site.use(date());
site.use(inline());
site.use(esbuild());
site.use(jsx_preact());
site.use(lightningcss());
site.use(metas());
site.use(multilanguage());
site.use(sitemap());
site.use(tailwindcss());
site.use(postcss())

export default site;

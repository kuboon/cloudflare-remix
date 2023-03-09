import { ImageResponse } from "workers-og";
import * as React from "react";
export async function loadGoogleFont({
  family,
  weight,
  text
}) {
  const params = {
    family: `${encodeURIComponent(family)}${weight ? `:wght@${weight}` : ""}`
  };
  if (text) {
    params.text = text;
  } else {
    params.subset = "latin";
  }
  const url = `https://fonts.googleapis.com/css2?${Object.keys(params).map((key) => `${key}=${params[key]}`).join("&")}`;
  const css = await fetch(`${url}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
    }
  }).then((res) => res.text());
  const fontUrl = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  )?.[1];
  if (!fontUrl) {
    throw new Error("Could not find font URL");
  }
  return fetch(fontUrl).then((res) => res.arrayBuffer());
}
export const generateImage = async (node) => {
  const notoSans = await loadGoogleFont({
    family: "Noto Sans JP",
    weight: 100
  });
  return new ImageResponse(node, {
    width: 1200,
    height: 630,
    debug: true,
    fonts: [
      {
        name: "NotoSansJP",
        data: notoSans,
        weight: 100,
        style: "normal"
      }
    ]
  });
};
const OgImage = ({
  title,
  content
}) => {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "pink"
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          fontSize: "64px",
          color: "filter: invert(100%) grayscale(100%) contrast(100)"
        }
      },
      title
    ),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "32px", color: "gray" } }, content)
  );
};
export const onRequestGet = async ({request}) => {
  const url = new URL(request.url);
  const title = url.searchParams.get("title");
  const content = url.searchParams.get("content");
  return generateImage(/* @__PURE__ */ React.createElement(OgImage, { title, content }));
};

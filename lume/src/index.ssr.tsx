import type { PageData } from "lume/core.ts";
export const title = "Welcome to my page";
export const layout = "layout.njk";

export default ({ title }: PageData) => (
  <>
    <div className="container mx-auto flex justify-center">
      <h1 className="py-12 mx-auto text-6xl">{title}</h1>
    </div>
    <div className="container mx-auto flex justify-center gap-2">
      <a href="/shared/1">Shared Page 1</a>
      <a href="/shared/2">Shared Page 2</a>
    </div>
    <div className="container mx-auto flex justify-center mt-10">
      <div className="p-6 border rounded shadow-lg grid grid-cols-2 gap-3">
        <p className="col-span-2">username</p>
        <input type="text" className="col-span-2 border rounded-full p-2" id="username" maxLength={25} />
        <button className="ring rounded-full p-2 bg-blue" id="button-register">Register</button>
        <button className="ring rounded-full p-2 " id="button-login">Login</button>
      </div>
      {/* @ts-ignore for inline */}
      <script type="module" src="../login.js" inline></script>
    </div>
  </>
);

export const title = "Welcome to my page";
export const layout = "layout.njk";

export default (data) => (
  <>
    <div>
      <h1>Welcome to Remix</h1>
      <a href="/shared/1">Shared Page</a>

      <div className="right-column fl">
        <h2><i className="fas fa-user-ninja"></i>&nbsp;Enter username</h2>
        <input type="text" className="full" id="username" maxLength={25} />
        <button className="button-primary fl half" id="button-register">Register</button>
        <button className="button-primary fl half" id="button-login">Login</button>
      </div>
      <script type="module" src="login.js" inline></script>
    </div>
  </>
);

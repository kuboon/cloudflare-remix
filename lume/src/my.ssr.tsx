export default function () {
  return <>
    <p>logged in</p>
    <p id='app'></p>
    {/* @ts-ignore for inline */}
    <script type="module" src="../my.js" inline></script>
  </>
}

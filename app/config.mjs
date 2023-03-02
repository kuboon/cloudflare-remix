const port = 8002
const domain = 'localhost'
const isSecure = port === 443
const origin = `http${isSecure ? 's' : ''}://${domain}:${port}`
const fido = {
  rpId: domain,
  rpName: 'remix-fido2-example',
  origin
}
export {
  origin,
  port,
  fido
}

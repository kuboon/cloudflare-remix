export function config(env = process.env){
  const port = env.PORT || 8789
  const domain = env.ORIGIN || 'localhost'
  const isSecure = port === 443
  const origin = `http${isSecure ? 's' : ''}://${domain}:${port}`
  return {
    origin,
    port,
    fido: {
      rpId: domain,
      rpName: 'remix-fido2-example',
      origin
    }
  }
}

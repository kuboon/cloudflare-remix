import { base64 } from "https://deno.land/x/b64@1.0.20/src/base64.js";

/**
 * Decodes arrayBuffer required fields.
 */
const preformatGetAssertReq = (getAssert) => {
  getAssert.challenge = base64.toArrayBuffer(getAssert.challenge, true);

  // Allow any credential, this will be handled later
  for (const allowCred of getAssert.allowCredentials) {
    allowCred.id = base64.toArrayBuffer(allowCred.id, true);
  }

  return getAssert;
};

/**
 * Decodes arrayBuffer required fields.
 */
const preformatMakeCredReq = (makeCredReq) => {
  makeCredReq.challenge = base64.toArrayBuffer(makeCredReq.challenge, true);
  makeCredReq.user.id = base64.toArrayBuffer(makeCredReq.user.id, true);

  // Decode id of each excludeCredentials
  if (makeCredReq.excludeCredentials) {
    makeCredReq.excludeCredentials = makeCredReq.excludeCredentials.map((e) => {
      return { id: base64.toArrayBuffer(e.id, true), type: e.type };
    });
  }

  return makeCredReq;
};

const getMakeCredentialsChallenge = (formBody, additional) => {
  return fetch(additional ? "webauthn/add" : "webauthn/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status !== "ok") {
        throw new Error(
          `Server responed with error. The message is: ${response.message}`,
        );
      }

      return response;
    });
};

const sendWebAuthnResponse = (body) => {
  return fetch("webauthn/response", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status !== "ok") {
        throw new Error(
          `Server responed with error. The message is: ${response.message}`,
        );
      }

      return response;
    });
};

const getGetAssertionChallenge = (formBody) => {
  return fetch("webauthn/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status !== "ok") {
        throw new Error(
          `Server responed with error. The message is: ${response.message}`,
        );
      }
      return response;
    });
};

/* Handle for register form submission */
export function register(username, additional) {
  const name = username;

  return getMakeCredentialsChallenge({ username, name }, additional)
    .then((response) => {
      const publicKey = preformatMakeCredReq(response);
      return navigator.credentials.create({ publicKey });
    })
    .then((response) => {
      const transports = response.response.getTransports
          ? response.response.getTransports()
          : undefined,
        makeCredResponse = {
          id: response.id,
          rawId: base64.fromArrayBuffer(response.rawId, true),
          transports,
          response: {
            attestationObject: base64.fromArrayBuffer(
              response.response.attestationObject,
              true,
            ),
            clientDataJSON: base64.fromArrayBuffer(
              response.response.clientDataJSON,
              true,
            ),
          },
          type: response.type,
        };
      return sendWebAuthnResponse(makeCredResponse);
    })
    .then((response) => {
      if (response.status !== "ok") {
        return Promise.reject(
          `Server responed with error. The message is: ${response.message}`,
        );
      }
    });
}

/**
 * Converts PublicKeyCredential into serialised JSON
 * @param  {Object} pubKeyCred
 * @return {Object}            - JSON encoded publicKeyCredential
 */
const publicKeyCredentialToJSON = (pubKeyCred) => {
  if (pubKeyCred instanceof Array) {
    return pubKeyCred.map(publicKeyCredentialToJSON)
  }
  if (pubKeyCred instanceof Object) {
    const obj = {};
    for (const key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }
    return obj;
  }
  if (pubKeyCred instanceof ArrayBuffer) {
    return base64.fromArrayBuffer(pubKeyCred, true);
  }
  return pubKeyCred;
};


/* Handler for login form submission */
export function login(username) {
  return getGetAssertionChallenge({ username })
    .then((response) => {
      const publicKey = preformatGetAssertReq(response);
      return navigator.credentials.get({ publicKey });
    })
    .then((response) => {
      const getAssertionResponse = publicKeyCredentialToJSON(response);
      return sendWebAuthnResponse(getAssertionResponse);
    })
    .then((response) => {
      if (response.status !== "ok") {
        return Promise.reject(
          `Server responed with error. The message is: ${response.message}`,
        );
      }
    });
}

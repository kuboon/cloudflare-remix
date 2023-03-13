
import { database } from "../_lib/db/mod.js";
import base64 from "@hexagon/base64";
import { Fido2, IAssertionExpectations } from "../_lib/fido2.js";
import { commitSession, getSession } from "../_lib/sessions.js";
import { config } from "../_lib/config.mjs";
import type { Session } from "@remix-run/cloudflare";

interface Store {
	session: Session
	db: database
	f2l: Fido2
}

const userNameMaxLenght = 25;

function validateUsername(username: string): string | undefined {
	try {
		return username.replace(/[^a-z0-9\-_]/gi, "").toLowerCase()
	} catch (e) {
		return;
	}
}

/**
 * Returns base64url encoded buffer of the given length
 * @param  {Number} len - length of the buffer
 * @return {String}     - base64url random buffer
 */
const randomBase64URLBuffer = (len: number) => {
	len = len || 32;
	const randomBytes = new Uint8Array(len);
	crypto.getRandomValues(randomBytes);
	return base64.fromArrayBuffer(randomBytes, true);
};

interface Env {
	DB: D1Database;
}

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
    ...init,
  });
}

export const onRequestPost: PagesFunction<Env> = async ({request, params, env}) => {
	const reqBody = await request.json();
	if (!reqBody) return json({ ok: false, message: "no body" })


	const conf = config(env as unknown as Record<string, string>).fido
	const store = {
		session: await getSession(request.headers.get("Cookie")),
		db: new database(env.DB),
		f2l: new Fido2(conf.rpId, conf.rpName, conf.origin, 90000)
	}
	switch (params.action) {
		case "register":
			return register(reqBody as any, store);
		case "add":
			return add(reqBody, store);
		case "login":
			return login(reqBody, store);
		case "response":
			return response(reqBody, store);
	}
}

async function register(reqBody: { username: string }, { db, f2l, session }: Store) {
	if (!reqBody.username) {
		return json({
			"status": "failed",
			"message": "Request missing name or username field!"
		});
	}

	const userName = validateUsername(reqBody.username)

	if (!userName) {
		return json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}

	if (userName.length > userNameMaxLenght) {
		return json({
			"status": "failed",
			"message": "Username " + userName + " too long. Max username lenght is " + userNameMaxLenght + " characters!"
		});
	}

	const userInfo = await db.getUser(userName).catch(e => console.error(e));

	if (userInfo && userInfo.registered) {
		return json({
			"status": "failed",
			"message": `Username ${userName} already exists`
		});
	}

	const id = randomBase64URLBuffer(32);

	await db.createUser({
		id,
		userName,
		registered: 0,
	});

	const challengeMakeCred = await f2l.registration(userName, userName, id);

	// Transfer challenge and username to session
	await session.set("challenge", challengeMakeCred.challenge);
	await session.set("username", userName);

	// Respond with credentials
	return json(challengeMakeCred, {
		headers: {
			"Set-Cookie": await commitSession(session),
		}
	});
}

async function add(_reqBody: any, { db, f2l, session }: Store) {
	if (!session.get("loggedIn")) {
		return json({
			"status": "failed",
			"message": "User not logged in!"
		});
	}

	const usernameClean = validateUsername(session.get("username"));


	if (!usernameClean) {
		return json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}

	const userInfo = await db.getUser(usernameClean)
	if (!userInfo) {
		return json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}
	const challengeMakeCred: any = await f2l.registration(usernameClean, usernameClean, userInfo.id || "");

	// Transfer challenge to session
	session.set("challenge", challengeMakeCred.challenge);

	// Exclude existing credentials
	challengeMakeCred.excludeCredentials = (await db.getCredsForUser(userInfo.id)).map((e) => {
		return { id: e.credId, type: e.type };
	});
	// Respond with credentials
	return json(challengeMakeCred, {
		headers: {
			"Set-Cookie": await commitSession(session),
		}
	});
}

async function login(reqBody: any, { db, f2l, session }: Store) {
	if (!reqBody.username) {
		return json({
			"status": "failed",
			"message": "Request missing username field!"
		});
	}
	const usernameClean = validateUsername(reqBody.username);
	if (!usernameClean) {
		return json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}

	const userInfo = await db.getUser(usernameClean);

	if (!userInfo || !userInfo.registered) {
		return json({
			"status": "failed",
			"message": `User ${usernameClean} does not exist!`
		});
	}

	const assertionOptions = await f2l.login();

	// Transfer challenge and username to session
	session.set("challenge", assertionOptions.challenge);
	session.set("username", usernameClean);

	// Pass this, to limit selectable credentials for user... This may be set in response instead, so that
	// all of a users server (public) credentials isn't exposed to anyone
	const allowCredentials = (await db.getCredsForUser(userInfo.id)).map((cred: any) => ({
		type: cred.type,
		id: cred.credId,
		transports: JSON.parse(cred.transports)
	}))

	session.set("allowCredentials", allowCredentials);
	assertionOptions.allowCredentials = allowCredentials;
	return json(assertionOptions, {
		headers: {
			"Set-Cookie": await commitSession(session),
		}
	});
}

async function response(reqBody: any, { db, f2l, session }: Store) {
	if (!reqBody.id
		|| !reqBody.rawId || !reqBody.response
		|| !reqBody.type || reqBody.type !== "public-key") {
		return json({
			"status": "failed",
			"message": "Response missing one or more of id/rawId/response/type fields, or type is not public-key!"
		});
	}

	// Get user info
	const usernameClean = validateUsername(await session.get("username"));
	const userInfo = await db.getUser(usernameClean!);
	if (!userInfo) {
		return json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}

	const webauthnResp = reqBody;
	if (webauthnResp.response.attestationObject !== undefined) {
		/* This is create cred */
		webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
		webauthnResp.response.attestationObject = base64.toArrayBuffer(webauthnResp.response.attestationObject, true);
		try {
			const result = await f2l.attestation(webauthnResp, await session.get("challenge"));
			await db.createCred({
				credId: base64.fromArrayBuffer(result.authnrData!.get("credId"), true),
				userId: userInfo.id,
				publicKey: result.authnrData!.get("credentialPublicKeyPem"),
				type: webauthnResp.type,
				transports: JSON.stringify(webauthnResp.transports),
				counter: result.authnrData!.get("counter"),
				created_at: new Date().toISOString(),
			})
		} catch (e) {
			return json({
				"status": "failed",
				"message": "Invalid response!"
			});
		}
		await db.updateUser(userInfo.id, { registered: 1 })
		session.set("loggedIn", true);
		return json({ "status": "ok" }, {
			headers: {
				"Set-Cookie": await commitSession(session),
			}
		});
	} else if (webauthnResp.response.authenticatorData !== undefined) {
		/* This is get assertion */
		//result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database.users[request.session.username].authenticators);
		// add allowCredentials to limit the number of allowed credential for the authentication process. For further details refer to webauthn specs: (https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialrequestoptions-allowcredentials).
		// save the challenge in the session information...
		// send authnOptions to client and pass them in to `navigator.credentials.get()`...
		// get response back from client (clientAssertionResponse)
		webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
		webauthnResp.response.userHandle = webauthnResp.rawId;

		let winningAuthenticator;
		const allowCredentials = await session.get("allowCredentials");
		const challenge = await session.get("challenge");
		const creds = await db.getCredsForUser(userInfo.id)
		for (const cred of creds) {
			try {
				const expectedAssertionResult: IAssertionExpectations = {
					allowCredentials,
					challenge,
					origin: '',
					factor: "either",
					publicKey: cred.publicKey,
					prevCounter: cred.counter,
					userHandle: cred.credId
				};
				const result = await f2l.assertion(webauthnResp, expectedAssertionResult);

				winningAuthenticator = result;

				// Update authenticators
				// authr.counter = result.authnrData!.get("counter");
				// await updateUser(userInfo.userName!, { authenticators: userInfo.authenticators });
				break;

			} catch (e) {
				console.error(e);
			}
		}
		// authentication complete!
		if (winningAuthenticator && userInfo.registered) {
			session.set("loggedIn", true);
			return json({ "status": "ok" }, {
				headers: {
					"Set-Cookie": await commitSession(session),
				}
			});

			// Authentication failed
		} else {
			return json({
				"status": "failed",
				"message": "Can not authenticate signature!"
			});
		}
	} else {
		return json({
			"status": "failed",
			"message": "Can not authenticate signature!"
		});
	}
}

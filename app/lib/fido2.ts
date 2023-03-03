import base64 from "@hexagon/base64";
import { AssertionResult, AttestationResult, Fido2Lib } from "fido2-lib";

interface IAssertionExpectations {
	allowCredentials: any[];
	challenge: string;
	origin: string;
	factor: 'either';
	publicKey: string;
	prevCounter: number;
	userHandle: string;
}
class Fido2 {
	f2l: Fido2Lib;
	origin: string;

	constructor(rpId : string, rpName : string, origin: string, timeout: number) {
		this.f2l = new Fido2Lib({
			timeout,
			rpId,
			rpName,
			challengeSize: 128,
			attestation: "direct",
			cryptoParams: [-7, -257],
			authenticatorAttachment: undefined, // ["platform", "cross-platform"]
			authenticatorRequireResidentKey: false,
			authenticatorUserVerification: "preferred"
		});
		this.origin = origin
	}

	async registration(name : string, displayName : string, id : string) {
		const registrationOptions: any = await this.f2l.attestationOptions();

		// make sure to add registrationOptions.user.id
		registrationOptions.user = {
			id,
			name,
			displayName
		};

		registrationOptions.status = "ok";

		registrationOptions.challenge = base64.fromArrayBuffer(registrationOptions.challenge, true);

		return registrationOptions as {rp: any, user: any, challenge: string, status: string};
	}

	attestation(clientAttestationResponse: AttestationResult, challenge : string) {
		const attestationExpectations = {
			challenge,
			origin: this.origin,
			factor: "either" as const
		};
		return this.f2l.attestationResult(clientAttestationResponse, attestationExpectations);
	}

	async login() {
		const assertionOptions: any = await this.f2l.assertionOptions();
		assertionOptions.challenge = base64.fromArrayBuffer(assertionOptions.challenge, true);
		assertionOptions.status = "ok";
		return assertionOptions;
	}

	assertion(assertionResult: AssertionResult, expectedAssertionResult: IAssertionExpectations) {
		return this.f2l.assertionResult(assertionResult, {...expectedAssertionResult, origin: this.origin});
	}
}

export { Fido2 };
export type { IAssertionExpectations };

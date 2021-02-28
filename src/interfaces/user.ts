import config from "../config";
import jwkToPem from "jwk-to-pem";
import * as jwt from "jsonwebtoken";

export interface User {
    name: string
    cognitoUserId: string
    roleId: number
    signUpDate: string
}

export async function decodeIdToken(idToken: string) {
    const URL = `https://cognito-idp.${config.userPoolRegion}.amazonaws.com/${config.userPoolId}/.well-known/jwks.json`
    const pems: any = {}
    try{
        // @ts-ignore
        const response = await fetch(URL);
        if (response.status !== 200){
            throw `request to user pool is not successful`
        }
        const data = await response.json()
        const { keys } = data
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index]
            const key_id = key.kid
            const modulus = key.n
            const exponent = key.e
            const key_type = key.kty
            const jwk = { kty: key_type, n: modulus, e: exponent }
            const pem = jwkToPem(jwk)
            pems[key_id] = pem

        }

        console.log("got all pems: " + pems.toString())
    } catch (error) {
        console.log("cannot get pems")
        console.log(error)
    }


    //////pems for IDENTITY TOKEN
    let decodeIDJwt: any = jwt.decode(idToken, {complete: true})
    //console.log(decodeJwt) some info about user is here!!!
    if (!decodeIDJwt) {
        alert("ERROR WITH TOKEN")
    }

    let kid2 = decodeIDJwt.header.kid
    let pem2 = pems[kid2]
    if (!pem2) {
        alert("ERROR WITH pem2")
    }

    const decodedIdToken = await jwt.verify(idToken, pem2, {algorithms: ['RS256']});

    //console.log(`Decoded and verified id token from aws ${JSON.stringify(decodedIdToken)}`);
    // @ts-ignore
    //this.setState({userId: decodedIdToken.sub})
    return decodedIdToken.sub
}

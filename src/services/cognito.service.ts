import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

import config from "../config";
import {PromiseOutput} from "../interfaces/promiseOutput";

class CognitoService {
    private  config = {
        region: config.AWS.Cognito.userPoolRegion,
    }

    // private secretHash: string = config.AWS.Cognito.secretHash
    // private clientId: string = config.AWS.Cognito.clientId

    public cognitoIdentity: any;
    constructor() {

        this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config);
    }

    public async deleteUser(accessToken: string): Promise<PromiseOutput> {
        // const adminConfig = {
        //     region: config.userPoolRegion,
        //     credentials: new AWS.CognitoIdentityCredentials({
        //         IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId,
        //         // Logins: { // optional tokens, used for authenticated login
        //         //     'graph.facebook.com': 'FBTOKEN',
        //         //     'www.amazon.com': 'AMAZONTOKEN',
        //         //     'accounts.google.com': 'GOOGLETOKEN',
        //         //     'appleid.apple.com': 'APPLETOKEN'
        //         // }
        //     })
        // }
        //const adminCognitoIdentity = new AWS.CognitoIdentityServiceProvider(adminConfig);



        // var params = {
        //     UserPoolId: config.userPoolId, /* required */
        //     Username: username /* required */
        // };

        var params = {
            AccessToken: accessToken /* required */
        };
        try {
            const data = await this.cognitoIdentity.deleteUser(params).promise()
            return {
                success: true,
                msg: data
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                msg: error
            }
        }

    }

    // public async signUpUser(username: string, password: string, userAttr: Array<any>): Promise<PromiseOutput>{
    //     const params = {
    //         ClientId: this.clientId,
    //         Password: password,
    //         Username: username,
    //         SecretHash: this.generateHash(username),
    //         UserAttributes: userAttr
    //     }

    //     try{
    //         const data = await this.cognitoIdentity.signUp(params).promise();
    //         console.log(data)
    //         return {
    //             success: true,
    //             msg: data
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         return {
    //             success: false,
    //             msg: error.message
    //         }
    //     }
    // }

    // public async confirmUser(){

    // }

    // public async verifyAccount(username: string, code: string): Promise<PromiseOutput>{
    //     const params = {
    //         ClientId: this.clientId,
    //         ConfirmationCode: code,
    //         SecretHash: this.generateHash(username),
    //         Username: username
    //     }

    //     try{
    //         const data = await this.cognitoIdentity.confirmSignUp(params).promise();
    //         console.log(data)
    //         return {
    //             success: true,
    //             msg: data
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         return {
    //             success: false,
    //             msg: error.message
    //         }
    //     }
    // }

    // public async signInUser(username: string, password: string): Promise<PromiseOutput>{
    //     const params = {
    //         AuthFlow: 'USER_PASSWORD_AUTH',
    //         ClientId: this.clientId,
    //         AuthParameters: {
    //             'USERNAME': username,
    //             'PASSWORD': password,
    //             'SECRET_HASH': this.generateHash(username)
    //         }
    //     }

    //     try{
    //         let data = await this.cognitoIdentity.initiateAuth(params).promise()
    //         console.log(data)

    //         return {
    //             success: true,
    //             msg: data
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         return {
    //             success: false,
    //             msg: error.message
    //         }
    //     }


    // }

    // private generateHash(username: string): string{
    //     return crypto.createHmac('SHA256', this.secretHash)
    //         .update(username + this.clientId)
    //         .digest('base64')
    // }


}

export default CognitoService;
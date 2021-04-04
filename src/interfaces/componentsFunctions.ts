import * as AWS from "aws-sdk";
import config from "../config";
import {FetchParams, makeFetch} from "./FetchInterface";


export const getAllUserClusters = async (props: any, setState: any) => {
    const { authToken } = props;
    if (authToken === '') {
        return
    }

    let fetchParams: FetchParams = {
        url: '/clusters',
        token: authToken,
        method: 'GET',
        actionDescription: "get all user's clusters"
    }

    let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
    console.log(promiseJson)
    setState({clusters: promiseJson['items'].map((item:any, i:number) => {return {clusterId: item['ID']['S'], name: item['Name']['S']}})})
}
export const  downloadFile = (fileKey:string, cloud:string, fileName:string) => {
    console.log("Trying to download file: " + fileName)
    if (cloud === 'AWS'){

        AWS.config.region = config.AWS.region;
        AWS.config.credentials = new AWS.Credentials(config.AWS.S3.accessKeyId, config.AWS.S3.secretAccessKey);

        let s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {Bucket: config.AWS.S3.bucketName}
        });

        let promise = s3.getSignedUrlPromise('getObject', {
            Bucket: config.AWS.S3.bucketName,
            Key: fileKey,
            ResponseContentDisposition: 'attachment; filename ="' + fileName + '"'
        });
        promise.then((url) => {
            window.open( url, '_blank' );// + '?response-content-disposition=attachment;filename='+fileName
        }, (err) => { alert("Error with downloading your file: " + err) });
    }
}
import * as AWS from "aws-sdk";
import config from "../config";

export async function deleteFile(sender: any, S3uniqueName:string, fileId?: number){
    if(fileId === undefined){
        alert("File ID cannot be undefined.")
        return
    }

    console.log("Trying to delete file: " + S3uniqueName)

    AWS.config.update({
        region: config.AWS.S3.bucketRegion,
        credentials: new AWS.Credentials(config.AWS.S3.accessKeyId, config.AWS.S3.secretAccessKey)
    });


    const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: config.AWS.S3.bucketName}
    });

    const params = {  Bucket: config.AWS.S3.bucketName, Key: S3uniqueName };

    var localThis = sender
    s3.deleteObject(params, function(err, data) {
        if (err) {
            alert("Cannot delete this file from S3 bucket!")
            console.log(err, err.stack);
        }
        else {
            console.log();
            alert("File has been deleted from the cloud.")
            localThis.deleteFilePermanently(fileId)
        }
    })
}
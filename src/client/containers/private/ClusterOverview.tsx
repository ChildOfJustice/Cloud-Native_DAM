import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../../store/demo/store.service'
import {DemoActions} from '../../../store/demo/types';
import {Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import {Permission, FileMetadata} from "../../../interfaces/databaseTables";
import * as AWS from "aws-sdk";
import config from "../../../config";
import {History} from "history";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";

const mapStateToProps = ({ demo }: IRootState) => {
    const { authToken, idToken, loading } = demo;
    return { authToken, idToken, loading };
}

//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        loadStore: () => storeService.loadStore(dispatch),
    }
}

interface IState {
    files: FileMetadata[]
    coUsers: Permission[]
    principalUserId: string
    userId: string
    downloadPermissionCheckboxChecked: boolean
    uploadPermissionCheckboxChecked: boolean
    deletePermissionCheckboxChecked: boolean
    canGivePermissionsToOthersCheckboxChecked: boolean
    permissions: string
    S3DeleteTransactionError: boolean
}
interface IProps {
    clusterId: string
    history : History
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class ClusterOverview extends React.Component<ReduxType, IState> {
    public state: IState = {
        files: [],
        coUsers: [],
        principalUserId: "",
        userId: "",
        downloadPermissionCheckboxChecked: false,
        uploadPermissionCheckboxChecked: false,
        deletePermissionCheckboxChecked: false,
        canGivePermissionsToOthersCheckboxChecked: false,
        permissions: "0000",
        S3DeleteTransactionError: false
    }


    async componentDidMount() {

        await this.props.loadStore()

        this.getCurrentUserPermissions()
        // @ts-ignore
        this.loadFilesMetadata(this.props.match.params.clusterId)
        // @ts-ignore
        this.getAllCoUsers(this.props.match.params.clusterId);
    }

    //Initialization functions
    getCurrentUserPermissions = () => {

        const { authToken } = this.props;

        //check whether if the user is owner of this cluster
        const fetchParams: FetchParams = {
            // @ts-ignore
            url: '/clusters?clusterId=' + this.props.match.params.clusterId,
            token: authToken,
            method: 'GET',

            actionDescription: "get the cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            if(jsonRes['youAreTheOwner'] === true){
                this.setState({permissions: "1111"})
            } else {
                //the user is NOT the owner of this cluster, getting the permissions:
                const fetchParams: FetchParams = {
                    // @ts-ignore
                    url: '/permissions?action=getUserPermissions&clusterId=' + this.props.match.params.clusterId,
                    token: authToken,
                    method: 'GET',

                    actionDescription: "get permissions"
                }

                makeFetch<any>(fetchParams).then(jsonRes => {
                    console.log(jsonRes)
                    this.setState({permissions: jsonRes['permissions']})
                }).catch(error => alert("ERROR: " + error))
            }
        }).catch(error => alert("ERROR: " + error))
    }
    loadFilesMetadata = (clusterId: number) => {
        const { authToken } = this.props;

        const fetchParams: FetchParams = {
            url: '/files?clusterId='+clusterId,
            token: authToken,
            method: 'GET',

            actionDescription: "load files metadata"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({files: jsonRes['items'].map((item:any, i:number) => {return {id: item['SK']['S'], name: item['name']['S'], S3uniqueName: item['S3uniqueName']['S'], cloud: item['cloud']['S'], uploadedBy: item['uploadedBy']['S'], ownedBy: item['ownedBy']['S'], sizeOfFile_MB: item['sizeOfFile_MB']['N'], tagsKeys: item['tagsKeys']['SS'], tagsValues: item['tagsValues']['SS'], }})})
        }).catch(error => alert("ERROR: " + error))

    }
    getAllCoUsers = (clusterId: number) => {
        if(this.state.permissions[3] !== '1'){
            return//TODO check whether its being executed
        }
        const { authToken } = this.props;

        const fetchParams: FetchParams = {
            url: '/permissions?action=getAllCoUsers&clusterId='+clusterId,
            token: authToken,
            method: 'GET',

            actionDescription: "get all co-users"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({coUsers: jsonRes['items'].map((item:any, i:number) => {return {clusterId: item['ID']['S'], permissionId: item['SK']['S'], permissionGiverUserId: item['GiverUserID']['S'], permissions: item['Permissions']['S'], principalUserId: item['Data']['S']}})})
        }).catch(error => alert("ERROR: " + error))
    }
    //^


    //Request functions:
    shareCluster = () => {
        const downloadPerm = this.state.downloadPermissionCheckboxChecked ? 1 : 0;
        const uploadPerm = this.state.uploadPermissionCheckboxChecked ? 1 : 0;
        const deletePerm = this.state.deletePermissionCheckboxChecked ? 1 : 0;
        const canGivePermissionsToOthers = this.state.canGivePermissionsToOthersCheckboxChecked ? 1 : 0;
        const permissions = "" + downloadPerm + uploadPerm + deletePerm + canGivePermissionsToOthers
        let coUserData: Permission = {
            // @ts-ignore
            clusterId: this.props.match.params.clusterId,
            principalUserId: this.state.principalUserId,
            permissions: permissions,
        }
        const { authToken } = this.props;

        const fetchParams: FetchParams = {
            url: '/permissions',
            token: authToken,
            method: 'POST',
            body: coUserData,

            actionDescription: "create co-user"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            // @ts-ignore
            this.getAllCoUsers(this.props.match.params.clusterId);
        }).catch(error => alert("ERROR: " + error))

    }
    downloadFile = (fileKey:string, cloud:string, fileName:string) => {
        if(this.state.permissions[0] !== '1') {
            alert("You don't have permissions to download any files.")
            return
        }
        console.log("Trying to download file: " + fileName)
        if (cloud === 'AWS'){

            AWS.config.region = config.AWS.region; // Region
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId,
            });
            // AWS.config.update({
            //     region: config.AWS.S3.bucketRegion,
            //     credentials: new AWS.CognitoIdentityCredentials({
            //         IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId
            //     })
            // });

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

        // if(cloud == 'Azure'){
        //
        //     var url = "https://"+storageAccount+".blob.core.windows.net/"+storageName+"/" + fileName;
        //     var now = (new Date()).toUTCString();
        //
        //     var method = "GET";
        //     var headerResource = "x-ms-date:"+ now + "\nx-ms-version:2019-07-07";
        //     var canonicalizedResource = "/" + storageAccount + "/"+storageName+"/"+fileName;
        //     var contentEncoding = "";
        //     var contentLanguage = "";
        //     var contentLength = "";
        //     var contentMd5 = "";
        //     var contentType = "";
        //     var date = "";
        //     var ifModifiedSince = "";
        //     var ifMatch = "";
        //     var ifNoneMatch = "";
        //     var ifUnmodifiedSince = "";
        //     var range = "";
        //     var stringToSign = method + "\n" + contentEncoding + "\n" + contentLanguage + "\n" + contentLength + "\n" + contentMd5 + "\n" + contentType + "\n" + date + "\n" + ifModifiedSince + "\n" + ifMatch + "\n" + ifNoneMatch + "\n" + ifUnmodifiedSince + "\n" + range + "\n" + headerResource + "\n" + canonicalizedResource;
        //
        //     console.log("StringToSign: " + stringToSign);
        //
        //     var secret = CryptoJS.enc.Base64.parse(storageKey);
        //     var hash = CryptoJS.HmacSHA256(stringToSign, secret);
        //     var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
        //     var signature = hashInBase64;
        //
        //
        //     var AuthorizationHeader = "SharedKey " + storageAccount + ":" + signature;
        //
        //
        //     var xhttp = new XMLHttpRequest();
        //
        //     xhttp.addEventListener('load', function() {
        //         console.log(this.statusText);
        //         if(this.statusText == "OK"){
        //             const urlBlob = window.URL.createObjectURL(this.response);
        //             const a = document.createElement('a');
        //             a.style.display = 'none';
        //             a.href = urlBlob;
        //             a.download = fileName;
        //             document.body.appendChild(a);
        //             a.click();
        //             window.URL.revokeObjectURL(urlBlob);
        //             a.remove();
        //         } else {
        //             alert(this.statusText);
        //         }
        //     });
        //     xhttp.addEventListener('error', () => console.log("Request to "+url+" failed"));
        //
        //     xhttp.open("GET", url, true);
        //     xhttp.responseType = 'blob';
        //     xhttp.setRequestHeader("Cache-Control", "no-cache, must-revalidate, no-store");
        //     xhttp.setRequestHeader("Authorization", AuthorizationHeader);
        //     xhttp.setRequestHeader("x-ms-date", now);
        //     xhttp.setRequestHeader("x-ms-version", "2019-07-07");
        //     xhttp.send();
        //
        // }
    }
    deleteFile = async (S3uniqueName:string, fileId: number | null) => {
        if(this.state.permissions[2] !== '1') {
            alert("You don't have permissions to delete any files!")
            return
        }

        console.log("Trying to delete file: " + S3uniqueName)

        let deletePermanently = prompt('Type "delete" to permanently delete the file or leave it blank to just unlink this file from the current cluster.', '');

        if(deletePermanently === 'delete'){
            //TODO need to be a Transaction!!!
            AWS.config.update({
                region: config.AWS.S3.bucketRegion,
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId
                })
            });

            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: config.AWS.S3.bucketName}
            });

            const params = {  Bucket: config.AWS.S3.bucketName, Key: S3uniqueName };

            // let error = -1 //TODO CHECK THE ERROR
            // let localState = this.state
            // localState.S3DeleteTransactionError = false
            var localThis = this
            s3.deleteObject(params, function(err, data) {
                if (err) {
                    alert("Cannot delete this file from S3 bucket!")
                    console.log(err, err.stack);  // error
                    // error = 1
                    // localState.S3DeleteTransactionError = true
                }
                else {
                    // error = 0
                    console.log();
                    alert("File has been deleted from the cloud.")
                    // localState.S3DeleteTransactionError = false
                    localThis.deleteFilePermanently(fileId)
                }
            })
            // while(error === -1){
            //     //TODO BADDDDDDDDRRRR
            //     //waiting for the response
            // }
            // alert(error)
            // alert(this.state.S3DeleteTransactionError)
            // if(error === 0){
            //
            // }
        } else {
            //Just delete the file-cluster record for this file
            // @ts-ignore
            let clusterId_ = this.props.match.params.clusterId

            const { authToken } = this.props;

            let fileData = {
                fileId: fileId,
                clusterId: clusterId_
            }
            const fetchParams: FetchParams = {
                url: '/files?action=removeFromCluster',
                token: authToken,
                method: 'DELETE',
                body: fileData,

                actionDescription: "delete the file-cluster record"
            }

            makeFetch<string>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                console.log("Successfully deleted the file-cluster record")

            }).catch(error => alert("ERROR: " + error))
        }
    }
    deleteFilePermanently = (fileId: number) => {
        const { authToken } = this.props;

        let fileData = {
            fileId: fileId
        }
        const fetchParams: FetchParams = {
            url: '/files',
            token: authToken,
            method: 'DELETE',
            body: fileData,

            actionDescription: "delete file and its metadata"
        }

        makeFetch<string>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            console.log("Successfully deleted the file")

        }).catch(error => alert("ERROR: " + error))
    }
    deleteCoUser = (couserPermission: Permission) => {

        const { authToken } = this.props;
        let permissionData: Permission = {
            // @ts-ignore
            clusterId: this.props.match.params.clusterId,
            permissionId: couserPermission.permissionId
        }
        const fetchParams: FetchParams = {
            url: '/permissions',
            token: authToken,
            method: 'DELETE',
            body: permissionData,

            actionDescription: "delete co-user permission"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.getAllCoUsers(permissionData.clusterId)
        }).catch(error => alert("ERROR: " + error))
    }

    _onChangeCoUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({principalUserId: (e.target as HTMLInputElement).value})
    }
    handleDownloadPermissionChange = (evt: any) => {
        this.setState({ downloadPermissionCheckboxChecked: evt.target.checked });
    }
    handleUploadPermissionChange = (evt: any) => {
        this.setState({ uploadPermissionCheckboxChecked: evt.target.checked });
    }
    handleDeletePermissionChange = (evt: any) => {
        this.setState({ deletePermissionCheckboxChecked: evt.target.checked });
    }
    handleCanGivePermissionsToOthersChange = (evt: any) => {
        this.setState({ canGivePermissionsToOthersCheckboxChecked: evt.target.checked });
    }

    // @ts-ignore
    SharePanel = ({ canShare }) => (
        <div className="SharePanel">
            {canShare ?
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>Share this cluster</Form.Label><br/>
                    <Form.Label>User to share with</Form.Label>
                    <Form.Control onChange={this._onChangeCoUserId} type="string" placeholder="User Id"/>
                    <Form.Label>Permissions for the user</Form.Label>
                    <Form.Check
                        type={"checkbox"}
                        label={"Download"}
                        onChange={this.handleDownloadPermissionChange}
                    />
                    <Form.Check
                        type={"checkbox"}
                        onChange={this.handleUploadPermissionChange}
                        label={"Upload"}
                    />
                    <Form.Check
                        type={"checkbox"}
                        onChange={this.handleDeletePermissionChange}
                        label={"Delete"}
                    />
                    <Form.Check
                        type={"checkbox"}
                        onChange={this.handleCanGivePermissionsToOthersChange}
                        label={"Can give permissions to others"}
                    />
                    <Button onClick={this.shareCluster} variant="primary">Share Cluster</Button>
                </Form.Group>
                : ''}
        </div>
    );

    // @ts-ignore
    UploadPanel = ({ canUpload }) => (
        <div className="UploadPanel">
            {canUpload ?
                <LinkContainer to={// @ts-ignore
                    "/private/uploadFile/" + this.props.match.params.clusterId}>
                    <Navbar.Brand>Upload file</Navbar.Brand>
                </LinkContainer>
                : ''}
        </div>
    );

    // @ts-ignore
    MainComponent = ({ counter }) => (
        <div className="MainComponent">
            {(this.state.permissions === '0000') ?
                <div>
                    You do not have permissions to see this cluster.<br/>
                    ERROR 403
                </div>
                :
                <div>
                    your permissions are:<br/>

                    {(this.state.permissions[0] === '1') ?
                        <div>
                            You can Download files<br/>
                        </div>
                        : ''}
                    {(this.state.permissions[1] === '1') ?
                        <div>
                            You can Upload files<br/>
                        </div>
                        : ''}
                    {(this.state.permissions[2] === '1') ?
                        <div>
                            You can Delete files<br/>
                        </div>
                        : ''}
                    {(this.state.permissions[3] === '1') ?
                        <div>
                            You can give permissions to other users<br/>
                        </div>
                        : ''}

                    <this.UploadPanel canUpload={this.state.permissions[1] === "1"}/>
                    <br/>

                    <this.SharePanel canShare={this.state.permissions[3] === '1'}/>

                    <Table striped bordered hover variant="dark">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>File Name</th>
                            <th>Cloud provider</th>
                            <th>File owner</th>
                            <th>Uploaded by</th>
                            <th>File size (MBs)</th>
                            <th>    User</th>
                            <th>Tags</th>
                            <th>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.files.map(
                            (fileMetadata: FileMetadata) =>
                                <tr >
                                    <td key={counter}>
                                        {counter++}
                                    </td>
                                    <td onClick={() => this.downloadFile(fileMetadata.S3uniqueName, fileMetadata.cloud, fileMetadata.name)}>
                                        {fileMetadata.name}
                                    </td>
                                    <td>
                                        {fileMetadata.cloud}
                                    </td>
                                    <td>
                                        {fileMetadata.uploadedBy}
                                    </td>
                                    <td>
                                        {fileMetadata.ownedBy}
                                    </td>
                                    <td>
                                        {fileMetadata.sizeOfFile_MB}
                                    </td>
                                    <td>
                                        {fileMetadata.tagsKeys.map(keyName => <div>{keyName}</div>) }
                                    </td>
                                    <td>
                                        {fileMetadata.tagsValues.map(keyName => <div>{keyName}</div>) }
                                    </td>
                                    <td>
                                        <Button onClick={() => this.deleteFile(fileMetadata.S3uniqueName, fileMetadata.id)} variant="danger">X</Button>
                                    </td>
                                </tr>
                        )}

                        </tbody>
                    </Table>

                    This cluster is shared with: <br/>
                    {(this.state.permissions[3] === '1') ?
                    <Table striped bordered hover variant="light">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>User ID</th>
                            <th>Permissions</th>
                            <th>Permission giver user ID</th>
                            <th>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.coUsers.map(
                            (couserData: Permission) =>
                                <tr >
                                    <td key={counter}>
                                        {counter++}
                                    </td>
                                    <td key={couserData.principalUserId}>
                                        {couserData.principalUserId}
                                    </td>
                                    <td>
                                        {couserData.permissions}
                                    </td>
                                    <td>
                                        {couserData.permissionGiverUserId}
                                    </td>
                                    <td>
                                        <Button onClick={() => this.deleteCoUser(couserData)} variant="danger">X</Button>
                                    </td>
                                </tr>
                        )}

                        </tbody>
                    </Table>
                        : 'You do not have permissions to see this.'}
                </div>
            }
        </div>
    );

    render() {

        let counter = 1
        return (
            <this.MainComponent counter={counter}/>
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(ClusterOverview);
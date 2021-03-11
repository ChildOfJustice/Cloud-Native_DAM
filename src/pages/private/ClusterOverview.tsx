import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../store/demo/store.service'
import {DemoActions} from '../../store/demo/types';
import {Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import {CoUser, FileMetadata} from "../../interfaces/databaseTables";
import * as AWS from "aws-sdk";
import config from "../../config";
import {decodeIdToken} from "../../interfaces/user";
import {History} from "history";
import {FetchParams, makeFetch} from "../../interfaces/FetchInterface";

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
    coUsers: CoUser[]
    coUserId: string
    userId: string
    downloadPermissionCheckboxChecked: boolean
    uploadPermissionCheckboxChecked: boolean
    deletePermissionCheckboxChecked: boolean
    canGivePermissionsToOthersCheckboxChecked: boolean
    permissions: string
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
        coUserId: "",
        userId: "",
        downloadPermissionCheckboxChecked: false,
        uploadPermissionCheckboxChecked: false,
        deletePermissionCheckboxChecked: false,
        canGivePermissionsToOthersCheckboxChecked: false,
        permissions: "0000"
    }


    constructor(props: ReduxType) {
        super(props);
    }

    async componentDidMount() {

        await this.props.loadStore()
        await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
        // @ts-ignore
        await this.getCurrentUserPermissions()

        // @ts-ignore
        this.loadFilesMetadata(this.props.match.params.clusterId)

        // @ts-ignore
        this.getAllCousers(this.props.match.params.clusterId);

    }

    deleteFile = (S3uniqueName:string, fileId: number | null) => {
        console.log("Trying to delete file: " + S3uniqueName)

        if(this.state.permissions[2] != '1') {
            alert("You don't have permissions to delete any files!")
            return
        }

        AWS.config.update({
            region: config.AWS.S3.bucketRegion,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId
            })
        });

        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {Bucket: config.AWS.S3.bucketName}
        });

        var params = {  Bucket: config.AWS.S3.bucketName, Key: S3uniqueName };

        s3.deleteObject(params, function(err, data) {
            if (err) {
                alert("Cannot delete this file from S3 bucket!")
                console.log(err, err.stack);  // error
            }
            else {
                console.log();
                alert("File has been deleted.")
            }
        })

        // @ts-ignore
        var clusterId_ = this.props.match.params.clusterId

        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/file_cluster/delete?fileId='+fileId+"&clusterId="+clusterId_,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'DELETE',
            body: null,

            actionDescription: "delete file-cluster note"
        }

        makeFetch<string>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            console.log("Successfully deleted file-cluster")

            const fetchParams: FetchParams = {
                url: '/files/metadata/delete?id='+fileId,
                //authToken: authToken,
                //idToken: idToken,
                token: "",
                method: 'DELETE',
                body: null,

                actionDescription: "delete file metadata"
            }

            makeFetch<string>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                console.log("Successfully deleted file metadata")
                // @ts-ignore
                this.loadFilesMetadata(this.props.match.params.clusterId)
            }).catch(error => alert("ERROR: " + error))

            ///^
        }).catch(error => alert("ERROR: " + error))
    }

    downloadFile = (fileKey:string, cloud:string, fileName:string) => {
        console.log("Trying to download file: " + fileName)
        if(this.state.permissions[0] != '1') {
            alert("You don't have permissions to download any files.")
            return
        }
        if (cloud == 'AWS'){

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

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: config.AWS.S3.bucketName}
            });

            var promise = s3.getSignedUrlPromise('getObject', {
                Bucket: config.AWS.S3.bucketName,
                Key: fileKey,
                ResponseContentDisposition: 'attachment; filename ="' + fileName + '"'
            });
            promise.then(function(url) {
                window.open( url, '_blank' );// + '?response-content-disposition=attachment;filename='+fileName
            }, function(err) { alert("Error with downloading your file: " + err) });


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

    loadFilesMetadata = (clusterId: number) => {
        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/files/metadata/findAll?clusterId='+clusterId,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'GET',
            body: null,

            actionDescription: "load files metadata"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({files: jsonRes})
        }).catch(error => alert("ERROR: " + error))

    }

    getAllCousers = (clusterId: number) => {
        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/cousers/findAll?clusterId='+clusterId,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'GET',
            body: null,

            actionDescription: "get all co-users"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({coUsers: jsonRes})
        }).catch(error => alert("ERROR: " + error))

    }
    getCurrentUserPermissions = () => {
        if(this.state.userId == ''){
            return
        }

        let gotPerms = false

        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            // @ts-ignore
            url: '/clusters/?clusterId='+this.props.match.params.clusterId,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'GET',
            body: null,

            actionDescription: "get owner user id for the cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            if(jsonRes[0].ownerUserId == this.state.userId){
                this.setState({permissions: "1111"})
                gotPerms = true
            }
            if(!gotPerms) {
                const { authToken, idToken, loading} = this.props;

                const fetchParams: FetchParams = {
                    // @ts-ignore
                    url: '/cousers/getPermissions?userId=' + this.state.userId + '&clusterId=' + this.props.match.params.clusterId,
                    //authToken: authToken,
                    //idToken: idToken,
                    token: "",
                    method: 'GET',
                    body: null,

                    actionDescription: "get permissions"
                }

                makeFetch<any>(fetchParams).then(jsonRes => {
                    console.log(jsonRes)
                    this.setState({permissions: jsonRes[0].permissions})
                }).catch(error => alert("ERROR: " + error))

            }
        }).catch(error => alert("ERROR: " + error))

    }
    shareCluster = () => {
        const downloadPerm = this.state.downloadPermissionCheckboxChecked ? 1 : 0;
        const uploadPerm = this.state.uploadPermissionCheckboxChecked ? 1 : 0;
        const deletePerm = this.state.deletePermissionCheckboxChecked ? 1 : 0;
        const canGivePermissionsToOthers = this.state.canGivePermissionsToOthersCheckboxChecked ? 1 : 0;
        const permissions = "" + downloadPerm + uploadPerm + deletePerm + canGivePermissionsToOthers
        let coUserData: CoUser = {
            // @ts-ignore
            clusterId: this.props.match.params.clusterId,
            permissionGiverUserId: this.state.userId,
            coUserId: this.state.coUserId,
            permissions: permissions,
        }
        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/cousers/create',
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'POST',
            body: coUserData,

            actionDescription: "create co-user"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            // @ts-ignore
            this.getAllCousers(this.props.match.params.clusterId);
        }).catch(error => alert("ERROR: " + error))

    }
    deleteCouser = (couserId: string) => {
        let coUserData: CoUser = {
            // @ts-ignore
            clusterId: this.props.match.params.clusterId,
            permissionGiverUserId: "",
            coUserId: couserId,
            permissions: "",
        }
        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/cousers/delete?clusterId='+coUserData.clusterId+"&coUserId="+couserId,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'DELETE',
            body: null,

            actionDescription: "delete co-user"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.getAllCousers(coUserData.clusterId)
        }).catch(error => alert("ERROR: " + error))
    }

    _onChangeCoUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({coUserId: (e.target as HTMLInputElement).value})
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
    SharePanel = () => (
        <div className="SharePanel">
            {(this.state.permissions[3] == '1') ?
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
            {(this.state.permissions == '0000') ?
                <div>
                    You do not have permissions to see this cluster.<br/>
                    ERROR 403
                </div>
                :
                <div>
                    your permissions are:<br/>

                    {(this.state.permissions[0] == '1') ?
                        <div>
                            You can Download files<br/>
                        </div>
                        : ''}
                    {(this.state.permissions[1] == '1') ?
                        <div>
                            You can Upload files<br/>
                        </div>
                        : ''}
                    {(this.state.permissions[2] == '1') ?
                        <div>
                            You can Delete files<br/>
                        </div>
                        : ''}
                    {(this.state.permissions[3] == '1') ?
                        <div>
                            You can give permissions to other users<br/>
                        </div>
                        : ''}

                    <this.UploadPanel canUpload={this.state.permissions[1] == "1"}/>
                    <br/>

                    <this.SharePanel/>

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
                    {(this.state.permissions[3] == '1') ?
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
                            (couserData: CoUser) =>
                                <tr >
                                    <td key={counter}>
                                        {counter++}
                                    </td>
                                    <td key={couserData.coUserId}>
                                        {couserData.coUserId}
                                    </td>
                                    <td>
                                        {couserData.permissions}
                                    </td>
                                    <td>
                                        {couserData.permissionGiverUserId}
                                    </td>
                                    <td>
                                        <Button onClick={() => this.deleteCouser(couserData.coUserId)} variant="danger">X</Button>
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

        var counter = 1
        return (
            <this.MainComponent counter={counter}/>
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(ClusterOverview);
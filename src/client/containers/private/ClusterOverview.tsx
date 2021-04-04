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
import {FileMetadata, Permission} from "../../../interfaces/databaseTables";
import * as AWS from "aws-sdk";
import config from "../../../config";
import {History} from "history";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import {downloadFile} from "../../../interfaces/componentsFunctions";

const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}

//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        loadStore: () => storeService.loadStore(dispatch),
    }
}

interface IState {
    clusterName: string
    files: FileMetadata[]
    coUsers: Permission[]
    principalUserName: string
    currentClusterId: string
    downloadPermissionCheckboxChecked: boolean
    uploadPermissionCheckboxChecked: boolean
    deletePermissionCheckboxChecked: boolean
    canGivePermissionsToOthersCheckboxChecked: boolean
    permissions: string
    S3DeleteTransactionError: boolean
}

interface IProps {
    clusterId: string
    history: History
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class ClusterOverview extends React.Component<ReduxType, IState> {
    public state: IState = {
        clusterName: "",
        files: [],
        coUsers: [],
        principalUserName: "",
        currentClusterId: "",
        downloadPermissionCheckboxChecked: false,
        uploadPermissionCheckboxChecked: false,
        deletePermissionCheckboxChecked: false,
        canGivePermissionsToOthersCheckboxChecked: false,
        permissions: "0000",
        S3DeleteTransactionError: false
    }


    async componentDidMount() {

        await this.props.loadStore()


        // @ts-ignore
        let clusterId = this.props.match.params.clusterId
        //alert('GOT ID: ' + clusterId)
        await this.setState({currentClusterId: clusterId})
        //alert('set ID: ' + this.state.currentClusterId)
        // if (clusterId !== ''){
        //     await localStorage.setItem('currentClusterId', clusterId)
        //     await this.setState({currentClusterId: clusterId})
        //     alert('set ID: ' + this.state.currentClusterId)
        // } else {
        //     clusterId = await localStorage.getItem('currentClusterId')
        //     await this.setState({currentClusterId: clusterId})
        //     alert('loaded ID: ' + this.state.currentClusterId)
        // }

        this.getCurrentUserPermissions()
    }

    //Initialization functions
    getCurrentUserPermissions = () => {


        const {authToken} = this.props

        //check whether if the user is owner of this cluster
        //alert('request with ID: ' + this.state.currentClusterId)//already encoded from PersonalPage
        const fetchParams: FetchParams = {
            // @ts-ignore
            url: '/clusters?clusterId=' + this.state.currentClusterId,
            token: authToken,
            method: 'GET',

            actionDescription: "get the cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)

            this.setState({clusterName: jsonRes['cluster']['Name']['S']})

            if (jsonRes['youAreTheOwner'] === true) {
                this.setState({permissions: "1111"})
                this.loadFilesMetadata()
                this.getAllCoUsers()
            } else {
                //the user is NOT the owner of this cluster, getting the permissions:
                const fetchParams: FetchParams = {
                    // @ts-ignore
                    url: '/permissions?action=getUserPermissions&clusterId=' + this.state.currentClusterId,
                    token: authToken,
                    method: 'GET',

                    actionDescription: "get permissions"
                }

                makeFetch<any>(fetchParams).then(jsonRes => {
                    console.log(jsonRes)
                    this.setState({permissions: jsonRes['permissions']})
                    this.loadFilesMetadata()
                    this.getAllCoUsers()
                }).catch(error => alert("ERROR: " + error))
            }


        }).catch(error => alert("ERROR: " + error))
    }
    loadFilesMetadata = () => {
        if (this.state.permissions[0] !== '1' && this.state.permissions[2] !== '1') {
            return
        }

        let clusterId = this.state.currentClusterId

        const {authToken} = this.props;

        const fetchParams: FetchParams = {
            url: '/files?clusterId=' + clusterId,
            token: authToken,
            method: 'GET',

            actionDescription: "load files metadata"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({
                files: jsonRes['items'].map((item: any, i: number) => {
                    return {
                        id: item['SK']['S'],
                        name: item['Name']['S'],
                        S3uniqueName: item['S3uniqueName']['S'],
                        cloud: item['Cloud']['S'],
                        uploadedBy: item['UploadedBy']['S'],
                        ownedBy: item['OwnedBy']['S'],
                        sizeOfFile_MB: item['SizeOfFile_MB']['N'],
                        tagsKeys: item['TagsKeys']['SS'],
                        tagsValues: item['TagsValues']['SS'],
                    }
                })
            })
        }).catch(error => alert("ERROR: " + error))

    }
    getAllCoUsers = () => {
        let clusterId = this.state.currentClusterId

        if (this.state.permissions[3] !== '1') {
            return//TODO check whether its being executed
        }
        const {authToken} = this.props;

        const fetchParams: FetchParams = {
            url: '/permissions?action=getAllCoUsers&clusterId=' + clusterId,
            token: authToken,
            method: 'GET',

            actionDescription: "get all co-users"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({
                coUsers: jsonRes['items'].map((item: any, i: number) => {
                    return {
                        clusterId: item['ID']['S'],
                        permissionId: item['SK']['S'],
                        permissionGiverUserName: item['GiverUserName']['S'],
                        permissions: item['Permissions']['S'],
                        principalUserName: item['Data']['S']
                    }
                })
            })
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
            clusterId: decodeURIComponent(this.state.currentClusterId),
            clusterName: this.state.clusterName,
            principalUserName: this.state.principalUserName,
            permissions: permissions,
        }
        const {authToken} = this.props;

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
            this.getAllCoUsers();
        }).catch(error => alert("ERROR: " + error))

    }
    deleteFile = async (S3uniqueName: string, fileId?: number) => {
        if (this.state.permissions[2] !== '1') {
            alert("You don't have permissions to delete any files!")
            return
        }
        if (fileId === undefined) {
            alert("File ID cannot be undefined.")
            return
        }

        console.log("Trying to delete file: " + S3uniqueName)

        let deletePermanently = prompt('Type "delete" to permanently delete the file or leave it blank to just unlink this file from the current cluster.', '');

        if (deletePermanently === 'delete') {

            // this.deleteFilePermanently(fileId)


            //TODO need to be a Transaction!!!
            AWS.config.update({
                region: config.AWS.S3.bucketRegion,
                credentials: new AWS.Credentials(config.AWS.S3.accessKeyId, config.AWS.S3.secretAccessKey)
            });


            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: config.AWS.S3.bucketName}
            });

            const params = {Bucket: config.AWS.S3.bucketName, Key: S3uniqueName};

            // let error = -1 //TODO CHECK THE ERROR
            // let localState = this.state
            // localState.S3DeleteTransactionError = false
            var localThis = this
            s3.deleteObject(params, function (err, data) {
                if (err) {
                    alert("Cannot delete this file from S3 bucket!")
                    console.log(err, err.stack);  // error
                    // error = 1
                    // localState.S3DeleteTransactionError = true
                } else {
                    // error = 0
                    console.log();
                    alert("File has been deleted from the cloud.")
                    // localState.S3DeleteTransactionError = false
                    localThis.deleteFilePermanently(fileId)
                }
            })
            // while(error === -1){
            //
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
            let clusterId_ = this.state.currentClusterId

            const {authToken} = this.props;

            let fileData = {
                fileId: fileId,
                clusterId: decodeURIComponent(clusterId_)
            }
            const fetchParams: FetchParams = {
                url: '/files',
                token: authToken,
                method: 'DELETE',
                body: fileData,

                actionDescription: "delete the file-cluster record"
            }

            makeFetch<string>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                console.log("Successfully deleted the file-cluster record")
                this.loadFilesMetadata()
            }).catch(error => alert("ERROR: " + error))
        }


    }
    deleteFilePermanently = (fileId?: number) => {
        const {authToken} = this.props;

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
            this.loadFilesMetadata()
        }).catch(error => alert("ERROR: " + error))
    }
    deleteCoUser = (couserPermission: Permission) => {

        const {authToken} = this.props;
        let permissionData: Permission = {
            // @ts-ignore
            clusterId: decodeURIComponent(this.state.currentClusterId),
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
            this.getAllCoUsers()
        }).catch(error => alert("ERROR: " + error))
    }

    _onChangeCoUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({principalUserName: (e.target as HTMLInputElement).value})
    }
    handleDownloadPermissionChange = (evt: any) => {
        this.setState({downloadPermissionCheckboxChecked: evt.target.checked});
    }
    handleUploadPermissionChange = (evt: any) => {
        this.setState({uploadPermissionCheckboxChecked: evt.target.checked});
    }
    handleDeletePermissionChange = (evt: any) => {
        this.setState({deletePermissionCheckboxChecked: evt.target.checked});
    }
    handleCanGivePermissionsToOthersChange = (evt: any) => {
        this.setState({canGivePermissionsToOthersCheckboxChecked: evt.target.checked});
    }

    // @ts-ignore
    SharePanel = ({canShare}) => (
        <div className="SharePanel">
            {canShare ?
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>Share this cluster</Form.Label><br/>
                    <Form.Label>User to share with</Form.Label>
                    {/*<select value={this.state.value} onChange={this.handleChange}>*/}
                    {/*    <option value="grapefruit">Грейпфрут</option>*/}
                    {/*    <option value="lime">Лайм</option>*/}
                    {/*    <option value="coconut">Кокос</option>*/}
                    {/*    <option value="mango">Манго</option>*/}
                    {/*</select>*/}
                    <Form.Control onChange={this._onChangeCoUserId} type="string" placeholder="User Name"/>
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
    UploadPanel = ({canUpload}) => (
        <div className="UploadPanel">
            {canUpload ?
                <LinkContainer to={// @ts-ignore
                    "/private/uploadFile/" + this.state.currentClusterId}>
                    <Navbar.Brand>Upload file</Navbar.Brand>
                </LinkContainer>
                : ''}
        </div>
    );

    // @ts-ignore
    MainComponent = ({clusterCounter, permissionCounter}) => (
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
                            <th> User</th>
                            <th>Tags</th>
                            <th>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.files.map(
                            (fileMetadata: FileMetadata) =>
                                <tr>
                                    <td key={clusterCounter}>
                                        {clusterCounter++}
                                    </td>
                                    <td>
                                        <Button
                                            onClick={() => downloadFile(fileMetadata.S3uniqueName, fileMetadata.cloud, fileMetadata.name)}
                                            variant="link">{fileMetadata.name}</Button>
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
                                        {fileMetadata.tagsKeys.map(keyName => <div>{keyName}</div>)}
                                    </td>
                                    <td>
                                        {fileMetadata.tagsValues.map(keyName => <div>{keyName}</div>)}
                                    </td>
                                    <td>
                                        <Button
                                            onClick={() => this.deleteFile(fileMetadata.S3uniqueName, fileMetadata.id)}
                                            variant="danger">X</Button>
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
                                <th>Principal user name</th>
                                <th>Permissions</th>
                                <th>Permission giver user name</th>
                                <th>Delete</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.coUsers.map(
                                (couserData: Permission) =>
                                    <tr>
                                        <td key={permissionCounter}>
                                            {permissionCounter++}
                                        </td>
                                        <td key={couserData.principalUserName}>
                                            {couserData.principalUserName}
                                        </td>
                                        <td>
                                            {couserData.permissions}
                                        </td>
                                        <td>
                                            {couserData.permissionGiverUserName}
                                        </td>
                                        <td>
                                            <Button onClick={() => this.deleteCoUser(couserData)}
                                                    variant="danger">X</Button>
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

        let clusterCounter = 1
        let permissionCounter = 1
        return (
            <this.MainComponent clusterCounter={clusterCounter} permissionCounter={permissionCounter}/>
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(ClusterOverview);
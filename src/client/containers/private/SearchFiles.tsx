import * as React from "react";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../../store/demo/store.service'
import {DemoActions} from '../../../store/demo/types';
import {Table} from "react-bootstrap";
import {Cluster, Permission} from "../../../interfaces/databaseTables";
import {FileOverviewType} from "../../../interfaces/componentsTypes";
import FileOverview from "../../components/FileOverview";
import * as AWS from "aws-sdk";
import config from "../../../config";
import {History} from "history";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import {
    downloadFile,
    getAllUserClusters,
    getAllUserFileOverviews,
    getAllUserFiles
} from "../../../interfaces/componentsFunctions";
import LoadingScreen from "../../components/LoadingScreen";
import {forEach} from "react-bootstrap/ElementChildren";

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
    filesOverviews: FileOverviewType[]
    chosenClusterId: string | undefined
    clusters: Cluster[]
    permissions: Permission[]
    loading: boolean
    loadingMessage: string
    //searchCriterion
}

interface IProps {
    history: History
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class SearchFiles extends React.Component<ReduxType, IState> {
    public state: IState = {
        chosenClusterId: '',
        filesOverviews: [],
        clusters: [],
        permissions: [],
        loading: false,
        loadingMessage: ''
    }


    async componentDidMount() {
        this.setState({loading: true, loadingMessage: "Loading your files"})
        try {
            await this.props.loadStore()

            const fetchParams: FetchParams = {
                url: '/files',
                token: this.props.authToken,
                method: 'GET',

                actionDescription: "get all user files"
            }
            let userFiles = await getAllUserFileOverviews(this.props.authToken, fetchParams)
            this.setState({filesOverviews: userFiles})
            const setState = this.setState.bind(this)
            await getAllUserClusters(this.props, setState)
            await this.getAllSharedClusters()
        } catch (e) {
            this.setState({loading: false, loadingMessage: ""})
        }
        this.setState({loading: false, loadingMessage: ""})
    }

    //Initialization functions
    getAllSharedClusters = async () => {

        const {authToken} = this.props;

        let fetchParams: FetchParams = {
            url: '/permissions?action=getUserPermissions',
            token: authToken,
            method: 'GET',

            actionDescription: "get all user permissions"
        }

        let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
        console.log(promiseJson)

        let clusters = this.state.clusters
        let permissions = promiseJson['items'].map((item: any, i: number) => {
            return {
                clusterId: item['ID']['S'],
                permissionId: item['SK']['S'],
                principalUserId: item['Data']['S'],
                permissionGiverUserId: item['GiverUserId']['S'],
                permissions: item['Permissions']['S'],
                clusterOwnerUserName: item['ClusterOwnerUserName']['S'],
                clusterName: item['ClusterName']['S']
            }
        })

        for (const permission of permissions) {
            clusters.push({
                clusterId: permission.clusterId,
                name: permission.clusterName,
                ownerUserName: permission.clusterOwnerUserName,
                permissions: permission.permissions
            })
        }
        this.setState({clusters: clusters})
        if (clusters.length !== 0) {
            this.setState({chosenClusterId: clusters[0].clusterId})
        }
    }
    //^


    deleteFile = (sender: any, S3uniqueName: string, fileId?: number) => {
        if (fileId === undefined) {
            alert("File ID cannot be undefined.")
            return
        }

        // eslint-disable-next-line no-restricted-globals
        let deleteFile = confirm("Delete the file from the cloud?");
        if (deleteFile) {
            this.setState({loading: true, loadingMessage: "Deleting the file from AWS cloud"})
            console.log("Trying to delete file: " + S3uniqueName)

            AWS.config.update({
                region: config.AWS.S3.bucketRegion,
                credentials: new AWS.Credentials(config.AWS.S3.accessKeyId, config.AWS.S3.secretAccessKey)
            });


            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: config.AWS.S3.bucketName}
            });

            const params = {Bucket: config.AWS.S3.bucketName, Key: S3uniqueName};

            var localThis = sender
            s3.deleteObject(params, async function (err, data) {
                if (err) {
                    alert("Cannot delete this file from S3 bucket!")
                    console.log(err, err.stack);  // error
                    localThis.setState({loading: false, loadingMessage: ""})
                    // error = 1
                    // localState.S3DeleteTransactionError = true
                } else {
                    // error = 0
                    console.log();
                    //alert("File has been deleted from the cloud.")
                    // localState.S3DeleteTransactionError = false
                    await localThis.deleteFilePermanently(fileId)
                    localThis.setState({loading: false, loadingMessage: ""})
                }
            })
        }
    }
    deleteFilePermanently = async (fileId?: number) => {
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

        let promiseJson: any = await makeFetch<string>(fetchParams).catch(error => alert("ERROR: " + error))
        console.log(promiseJson)
        console.log("Successfully deleted the file")
        const fetchParams2: FetchParams = {
            url: '/files',
            token: this.props.authToken,
            method: 'GET',

            actionDescription: "get all user files"
        }
        let userFiles = await getAllUserFileOverviews(this.props.authToken, fetchParams2)
        this.setState({filesOverviews: userFiles})
    }

    handleAddChosenFilesToCluster = async () => {

        for (let cluster of this.state.clusters){
            if(cluster.clusterId === this.state.chosenClusterId){
                if(cluster.permissions === undefined) //your own cluster //TODO wtf, its a security risk
                    break;
                else if(cluster.permissions[1] !== "1"){
                    alert("You do not have permissions to add files to this cluster.")
                    return
                }
            }
        }

        const {authToken} = this.props;

        let filesOverviews = this.state.filesOverviews
        for (const filesOverview of filesOverviews) {
            if (filesOverview.isChecked) {

                let body = {
                    action: 'addFileToCluster',
                    clusterId: this.state.chosenClusterId,
                    fileId: filesOverview.file.id,
                    fileName: filesOverview.file.name
                }

                const fetchParams: FetchParams = {
                    url: '/files',
                    token: authToken,
                    method: 'POST',
                    body: body,

                    actionDescription: "create file-cluster sub record"
                }


                let promiseJson = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
                console.log(promiseJson)
            }
        }
        alert("All chosen files have been added to the cluster.")

    }
    handleDeleteChosenFilesFromCluster = async () => {
        let clusterId_ = this.state.chosenClusterId

        const {authToken} = this.props;

        let filesOverviews = this.state.filesOverviews
        for (const filesOverview of filesOverviews) {
            if (filesOverview.isChecked) {
                let fileData = {
                    fileId: filesOverview.file.id,
                    clusterId: clusterId_
                }
                const fetchParams: FetchParams = {
                    url: '/files',
                    token: authToken,
                    method: 'DELETE',
                    body: fileData,

                    actionDescription: "delete the file-cluster record"
                }

                let promise = await makeFetch<string>(fetchParams).catch(error => alert("ERROR: " + error))
                console.log(promise)

            }
        }

        alert("All chosen files have been removed from the cluster.")
    }

    handleAllChecked = (event: any) => {
        let filesOverviews = this.state.filesOverviews
        filesOverviews.forEach(filesOverview => filesOverview.isChecked = event.target.checked)
        this.setState({filesOverviews: filesOverviews})
    }

    handleCheckChildElement = (event: any) => {

        let filesOverviews = this.state.filesOverviews
        filesOverviews.forEach(filesOverview => {
            //alert("WATCH this " + event.target.value + " and file's value: " + filesOverview.id + "and ischecked: " + event.target.checked)
            let filesOverviewIdInt: number = +filesOverview.id
            let eventTargetValueInt: number = +event.target.value
            if (filesOverviewIdInt === eventTargetValueInt) {
                filesOverview.isChecked = event.target.checked
            }

        })
        this.setState({filesOverviews: filesOverviews})
    }

    handleSelectClusterChange = (event: any) => {
        this.setState({chosenClusterId: event.target.value});
    }

    // @ts-ignore
    MainComponent = ({counter}) => (
        <div className="MainComponent">
            <form>
                <label>
                    Choose a cluster to add/remove files from:
                    <select value={this.state.chosenClusterId} onChange={this.handleSelectClusterChange}>
                        {
                            this.state.clusters.map((cluster, index) => {
                                return <option value={cluster.clusterId}>{cluster.name}</option>
                            })
                        }
                    </select>
                </label>
                {/*<input type="submit" value="Отправить" />*/}
            </form>
            <Button onClick={this.handleAddChosenFilesToCluster} variant="success">
                Add
            </Button>
            <Button onClick={this.handleDeleteChosenFilesFromCluster} variant="warning">
                Remove
            </Button>
            <div>
                <h1> Your files </h1>
                <input type="checkbox" onChange={this.handleAllChecked} value="checkedall"/> Check / Uncheck All
                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Chosen</th>
                        <th>File Name</th>
                        <th>Cloud provider</th>
                        <th>File owner</th>
                        <th>Uploaded by</th>
                        <th>File size (MBs)</th>
                        <th>Metadata</th>
                        <th>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.filesOverviews.map((fileOverview, index) => {
                            return (<FileOverview key={index} parent={this}
                                                  handleCheckChildElement={this.handleCheckChildElement}
                                                  handleDownloadFile={downloadFile} handleDeleteFile={this.deleteFile}
                                                  value={fileOverview}/>)
                        })
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    );

    render() {
        if(this.state.loading) {
            return (
                <LoadingScreen loadingMessage={this.state.loadingMessage}/>
            )
        }



        let counter = 1
        return (
            <this.MainComponent counter={counter}/>
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(SearchFiles);

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
import {Permission, FileMetadata, Cluster} from "../../../interfaces/databaseTables";
import {FileOverviewType} from "../../../interfaces/componentsTypes";
import FileOverview from "../../components/FileOverview";
import * as AWS from "aws-sdk";
import config from "../../../config";
import {History} from "history";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import {deleteFile} from "../../../interfaces/componentsFunctions";

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
    filesOverviews: FileOverviewType[]
    chosenClusterId: string
    clusters: Cluster[]
    //searchCriterion
}
interface IProps {
    history : History
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class SearchFiles extends React.Component<ReduxType, IState> {
    public state: IState = {
        // filesOverviews: [
        //     {id: 1, value: "banana", isChecked: false},
        //     {id: 2, value: "apple", isChecked: false},
        //     {id: 3, value: "mango", isChecked: false},
        //     {id: 4, value: "grap", isChecked: false}
        // ]
        chosenClusterId: '',
        filesOverviews: [],
        clusters: []
    }


    async componentDidMount() {

        await this.props.loadStore()

        this.getUserFiles()
    }
    //Initialization functions
    getUserFiles = () => {
        const { authToken } = this.props;

        const fetchParams: FetchParams = {
            url: '/files',
            token: authToken,
            method: 'GET',

            actionDescription: "load all user files"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({filesOverviews: jsonRes['items'].map((item:any, i:number) => {
                return {id: i, isChecked: false, file: {id: item['SK']['S'], name: item['Name']['S'], S3uniqueName: item['S3uniqueName']['S'], cloud: item['Cloud']['S'], uploadedBy: item['UploadedBy']['S'], ownedBy: item['OwnedBy']['S'], sizeOfFile_MB: item['SizeOfFile_MB']['N'], tagsKeys: item['TagsKeys']['SS'], tagsValues: item['TagsValues']['SS'], }}})})
        }).catch(error => alert("ERROR: " + error))

    }
    getAllUserClusters = () => {
        const { authToken } = this.props;
        if (authToken === '') {
            return
        }

        let fetchParams: FetchParams = {
            url: '/clusters',
            token: authToken,
            method: 'GET',
            actionDescription: "get all user's clusters"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)

            this.setState({clusters: jsonRes['items'].map((item:any, i:number) => {return {clusterId: item['ID']['S'], name: item['Name']['S']}})})
        }).catch(error => alert("ERROR: " + error))
    }
    //^

    handleAddAllFilesToCluster = () => {
        //TODO
    }
    handleDeleteAllFiles = () => {
        //TODO
    }

    downloadFile = (fileKey:string, cloud:string, fileName:string) => {
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



    handleAllChecked = (event: any) => {
        let filesOverviews = this.state.filesOverviews
        filesOverviews.forEach(filesOverview => filesOverview.isChecked = event.target.checked)
        this.setState({filesOverviews: filesOverviews})
    }

    handleCheckChildElement = (event: any) => {
        let filesOverviews = this.state.filesOverviews
        filesOverviews.forEach(filesOverview => {
            if (filesOverview.id === event.target.id)
                filesOverview.isChecked =  event.target.checked
        })
        this.setState({filesOverviews: filesOverviews})
    }

    handleSelectClusterChange = (event: any) => {
        this.setState({chosenClusterId: event.target.value});
    }

    handleChooseCluster = (event: any) => {
        alert('Ваш любимый Cluster: ' + this.state.chosenClusterId);
        event.preventDefault();
    }

    // @ts-ignore
    MainComponent = ({ counter }) => (
        <div className="MainComponent">
            <form onSubmit={this.handleChooseCluster}>
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
                <input type="submit" value="Отправить" />
            </form>
            <div>
                <h1> Your files </h1>
                <input type="checkbox" onChange={this.handleAllChecked}  value="checkedall" /> Check / Uncheck All
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
                    {
                        this.state.filesOverviews.map((fileOverview, index) => {
                            return (<FileOverview key={index} parent={this} handleCheckChildElement={this.handleCheckChildElement} handleDownloadFile={this.downloadFile} value={fileOverview} />)
                        })
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    );

    render() {

        let counter = 1
        return (
            <this.MainComponent counter={counter}/>
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(SearchFiles);
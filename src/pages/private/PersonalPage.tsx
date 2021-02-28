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
import {Cluster, FileMetadata} from "../../interfaces/databaseTables";
import config from "../../config";
import {decodeIdToken} from "../../interfaces/user";
import * as AWS from "aws-sdk";
import {History} from "history";
import CognitoService from "../../services/cognito.service";
import {FetchParams, makeFetch} from "../../interfaces/FetchInterface";
import {AWSError} from "aws-sdk";
import {DeleteObjectOutput} from "aws-sdk/clients/s3";

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

interface IProps {
    history: History
    /* other props for ChildComponent */
}

type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    newClusterName: string
    clusters: Cluster[]
    userId: string
    userRole: string
    queryToDB: string
    dbResponse: string
    usedStorageSize: number | string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        newClusterName: "",
        clusters: [],
        userId: '',
        userRole: 'NO_ROLE',
        queryToDB: '',
        dbResponse: '',
        usedStorageSize: 0
    }


    constructor(props: ReduxType) {
        super(props);
        alert(props)
    }

    async componentDidMount() {
        //await this.props.loadStore()
        // await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
        // await this.getAllUserClusters()
        // await this.getUserRole()
        // await this.getUsedStorageSize()

    }

    handleTableClick = () => {

    }

    createCluster = () => {

        let clusterData: Cluster = {
            clusterId: null,
            name: this.state.newClusterName,
            ownerUserId: this.state.userId,
        }

        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/clusters/create',
            authToken: authToken,
            idToken: idToken,
            method: 'POST',
            body: clusterData,

            actionDescription: "create cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.getAllUserClusters()
        }).catch(error => alert("ERROR: " + error))
    }
    deleteFile = (S3uniqueName: string, fileId: number | null) => {

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

        var params = {Bucket: config.AWS.S3.bucketName, Key: S3uniqueName};

        s3.deleteObject(params, function (err: AWSError, data: DeleteObjectOutput) {
            if (err) {
                alert("Cannot delete this file from S3 bucket!")
                console.log(err, err.stack);  // error
            } else {
                console.log();
                alert("File has been deleted.")
            }
        })

        // @ts-ignore
        var clusterId_ = this.props.match.params.clusterId
        const { authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/file_cluster/delete?fileId=' + fileId + "&clusterId=" + clusterId_,
            authToken: authToken,
            idToken: idToken,
            method: 'DELETE',
            body: null,

            actionDescription: "delete file-cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)

            const { authToken, idToken, loading} = this.props;

            const fetchParams: FetchParams = {
                url: '/files/metadata/delete?id=' + fileId,
                authToken: authToken,
                idToken: idToken,
                method: 'DELETE',
                body: null,

                actionDescription: "delete file"
            }

            makeFetch<any>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                // @ts-ignore
                this.loadFilesMetadata(this.props.match.params.clusterId)
            }).catch(error => alert("ERROR: " + error))
        }).catch(error => alert("ERROR: " + error))


    }

    async deleteCluster(clusterId: number | null) {

        var files: FileMetadata[]

        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/files/metadata/findAll?clusterId=' + clusterId,
            authToken: authToken,
            idToken: idToken,
            method: 'GET',
            body: null,

            actionDescription: "delete file"
        }

        await makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            files = jsonRes
            if (files.length != 0) {
                alert("You need to delete all files first!")
                return
            }
            //TODO use async and wait files to be deleted
            //delete each file from file-cluster table and from metadata table:
            files.forEach(file => {
                this.deleteFile(file.S3uniqueName, file.id)
            })
        }).catch(error => alert("ERROR: " + error))
        //get all files stored in this cluster



        //delete cousers associated with this cluster
        fetchParams = {
            url: '/cousers/deleteAllAssociatedWithCluster?clusterId=' + clusterId,
            authToken: authToken,
            idToken: idToken,
            method: 'DELETE',
            body: null,

            actionDescription: "delete all associated co-users with the cluster"
        }

        await makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
        }).catch(error => alert("ERROR: " + error))


        //delete cluster
        fetchParams = {
            url: '/clusters/delete?clusterId=' + clusterId,
            authToken: authToken,
            idToken: idToken,
            method: 'DELETE',
            body: null,

            actionDescription: "delete cluster"
        }

        await makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.getAllUserClusters()
        }).catch(error => alert("ERROR: " + error))


        this.props.history.push("/private/area")
    }

    async deleteUser() {
        if (this.state.clusters.length != 0) {
            alert("You need to delete all clusters first!")
            return
        }
        for (const cluster of this.state.clusters) {
            await this.deleteCluster(cluster.clusterId)
        }

        const cognito = new CognitoService();
        await cognito.deleteUser(this.props.authToken)
            .then(promiseOutput => {
                if (promiseOutput.success) {
                    console.log("user successfully deleted: " + promiseOutput.msg)
                    // @ts-ignore
                    //userCognitoId = promiseOutput.msg.UserSub
                } else {
                    console.log("ERROR WITH DELETING USER: " + promiseOutput.msg)
                    return
                }
            });

        //delete user
        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/users/delete?cognitoUserId=' + this.state.userId,
            authToken: authToken,
            idToken: idToken,
            method: 'DELETE',
            body: null,

            actionDescription: "delete user"
        }

        await makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.props.history.push("/")
        }).catch(error => alert("ERROR: " + error))
    }


    getUserRole = () => {
        if (this.state.userId == '') {
            return
        }

        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/users/find?userId=' + this.state.userId,
            authToken: authToken,
            idToken: idToken,
            method: 'GET',
            body: null,

            actionDescription: "get user role"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            //alert(JSON.stringify(jsonRes));
            this.setState({userRole: jsonRes[0].role})
        }).catch(error => alert("ERROR: " + error))


    }

    getAllUserClusters = () => {
        if (this.state.userId == '') {
            return
        }

        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/clusters/findAll?ownerUserId=' + this.state.userId,
            authToken: authToken,
            idToken: idToken,
            method: 'GET',
            body: null,

            actionDescription: "get all user's clusters"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({clusters: jsonRes})
        }).catch(error => alert("ERROR: " + error))
    }

    getUsedStorageSize = () => {

        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/files/metadata/calcUsedSize?ownerUserId=' + this.state.userId,
            authToken: authToken,
            idToken: idToken,
            method: 'GET',
            body: null,

            actionDescription: "get used storage size"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            if (jsonRes[0].usedStorageSize == null)
                this.setState({usedStorageSize: 0})
            else this.setState({usedStorageSize: jsonRes[0].usedStorageSize})
        }).catch(error => alert("ERROR: " + error))
    }

    makeAdminQuery = () => {
        if (this.state.queryToDB == '') {
            return
        }

        const data = {
            query: this.state.queryToDB
        }
        const {authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/protected/adminQuery',
            authToken: authToken,
            idToken: idToken,
            method: 'POST',
            body: data,

            actionDescription: "admin query"
        }

        makeFetch<string>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({dbResponse: JSON.stringify(jsonRes[0])})
        }).catch(error => alert("ERROR: " + error))
    }

    _onChangeClusterName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newClusterName: (e.target as HTMLInputElement).value})
    }
    _onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({queryToDB: (e.target as HTMLInputElement).value})
    }


    // @ts-ignore
    AdminPanel = ({isAdmin}) => (
        <div className="hello">
            {isAdmin ? <Form.Group controlId="adminPanel">
                <Form.Label>Query to Database</Form.Label>
                <Form.Control onChange={this._onChangeQuery} type="string" placeholder="Query"/>
                <Button onClick={this.makeAdminQuery} variant="primary">Make request</Button>

                <Form.Label>Response</Form.Label>
                <Form.Control as="textarea" value={this.state.dbResponse}/>
            </Form.Group> : ''}
        </div>
    );

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        const PersonalPage1 = (

            <div>
                {this.props}
            </div>
        )
        return (
            PersonalPage1
        )

        //!!
        var counter = 0

        const PersonalPage = (

            (this.state.userRole == 'NO_ROLE') ?
                <div>
                    Please login.<br/>
                    ERROR 403
                </div>
                :

            <div>
                Your user id is: "{this.state.userId}".<br/>
                Your role is: "{this.state.userRole}".<br/>
                Your current used storage size is {this.state.usedStorageSize} MB.
                <Button onClick={() => this.deleteUser()} variant="danger">DELETE THIS ACCOUNT</Button> <br/>

                <Form.Group controlId="formBasicUserName">
                    <Form.Label>Cluster Name</Form.Label>
                    <Form.Control onChange={this._onChangeClusterName} type="string" placeholder="Cluster name"/>
                </Form.Group>
                <Button onClick={this.createCluster} variant="primary">Create Cluster</Button>

                {/*<Button onClick={this.getAllUserClusters} variant="primary">Update clusters</Button>*/}

                <this.AdminPanel isAdmin={this.state.userRole == "ADMINISTRATOR"}/>

                <br/>
                <LinkContainer to="/private/sharedWithMeClusters">
                    <Button variant="primary">Shared with me</Button>
                </LinkContainer>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
                        <th>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.clusters.map(
                        (l: Cluster) => <LinkContainer to={{
                            pathname: '/private/clusters/' + l.clusterId,
                        }}>
                            <tr onClick={this.handleTableClick}>
                                <td key={counter}>
                                    {counter++}
                                </td>
                                <td>
                                    {l.name}
                                </td>
                                <td>
                                    <Button onClick={() => this.deleteCluster(l.clusterId)} variant="danger">X</Button>
                                </td>
                            </tr>
                        </LinkContainer>
                    )}

                    </tbody>
                </Table>
            </div>

        )


        return (
            PersonalPage
        )
    }


}

export default connect(mapStateToProps, mapDispatcherToProps)(PersonalPage);
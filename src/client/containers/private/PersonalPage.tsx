import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../../store/demo/store.service'
import {DemoActions} from '../../../store/demo/types';
import {Col, Row, Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Cluster} from "../../../interfaces/databaseTables";
import {History} from "history";
import CognitoService from "../../../services/cognito.service";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import * as tokensService from "../../../store/demo/tokens.service";
import Test from "../Test";
import {getAllUserClusters, getAllUserFiles} from "../../../interfaces/componentsFunctions";
import * as AWS from "aws-sdk";
import config from "../../../config";
import LoadingScreen from "../../components/LoadingScreen";
import Container from "react-bootstrap/Container";


const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}


//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        setAuthToken: (token: string) => tokensService.setAuthToken(dispatch, token),
        loadStore: () => storeService.loadStore(dispatch),
        saveStore: () => storeService.saveStore(dispatch),
        clearStore: () => storeService.clearStore(dispatch),
    }
}

interface IProps {
    history: History
    authToken: string
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
    usedStorageSize: number
    loading: boolean
    loadingMessage: string
}

class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        newClusterName: "",
        clusters: [],
        userId: '',
        userRole: 'NO_ROLE',
        queryToDB: '',
        dbResponse: '',
        usedStorageSize: -1,
        loading: false,
        loadingMessage: ''
    }

    async componentDidMount() {
        this.setState({loading: true, loadingMessage: "Loading your private page"})
        try {
            await this.getAuthToken()
            await this.getUserRole()
            const setState = this.setState.bind(this)
            await getAllUserClusters(this.props, setState)
            this.getUsedStorageSize()
        } catch (e) {
            this.setState({loading: false, loadingMessage: ""})
        }
        this.setState({loading: false, loadingMessage: ""})
    }

    //Initialization functions
    //getAuthToken = (callback: (next:any) => void) => {
    async getAuthToken() {

        // console.log(window.location.search.substring(1)); // should print "param1=value1&param2=value2...."
        //let id_token_param = window.location.search.substring(1); !!!! //access_token=...
        //var id_token = id_token_param.substring(id_token_param.indexOf('=')+1);//only token after '='(...)
        //id_token = id_token.split('&')[0]

        //hash:
        let token_params = window.location.hash.slice(1);
        let token_params_arr = token_params.split('&');
        let access_token = token_params_arr[0].substring(token_params_arr[0].indexOf('=') + 1)

        if (access_token === '') {
            await this.props.loadStore()          //ASYNC ACTION!!!!! (If you remove await - further code in this function wont have the token loaded from the store!!
        } else {
            await this.props.setAuthToken(access_token)
            await this.props.saveStore()    //ASYNC ACTION!!!!! (If you remove await - further code in this function wont have the new saved store with the token!!
        }
    }

    getUserRole = async () => {
        const {authToken} = this.props

        if (authToken === '') {
            alert('token is empty')
            return
        }

        let clusterData = {
            name: this.state.newClusterName
        }

        let fetchParams: FetchParams = {
            //url: '/users/find?userId=' + this.state.userId,
            url: '/users',
            token: authToken,
            method: 'POST',
            body: clusterData,

            actionDescription: "get user to set his role"
        }

        let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
        console.log(promiseJson)
        this.setState({userRole: promiseJson['role']})
    }
    getUsedStorageSize = async () => {

        const {authToken} = this.props;

        let fetchParams: FetchParams = {
            url: '/files/?calcUsedSize=true',
            token: authToken,
            method: 'GET',

            actionDescription: "get used storage size"
        }

        let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
        console.log(promiseJson)
        // if (jsonRes['usedStorageSize'] == null)
        //     this.setState({usedStorageSize: 0})
        //else this.setState({usedStorageSize: jsonRes['usedStorageSize']})
        this.setState({usedStorageSize: promiseJson['usedStorageSize']})
    }
    //^


    //Request functions:
    createCluster = () => {

        let clusterData: Cluster = {
            name: this.state.newClusterName
        }

        const {authToken} = this.props;

        const fetchParams: FetchParams = {
            url: '/clusters',
            token: authToken,
            method: 'POST',
            body: clusterData,
            actionDescription: "create cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            const setState = this.setState.bind(this)
            getAllUserClusters(this.props, setState)
        }).catch(error => alert("ERROR: " + error))
    }
    deleteCluster = async (clusterId: string | undefined) => {
        this.setState({loading: true, loadingMessage: "Deleting the cluster"})
        const {authToken} = this.props;

        //delete cluster
        let clusterData: Cluster = {
            clusterId: clusterId
        }

        let fetchParams = {
            url: '/clusters/delete',
            token: authToken,
            method: 'DELETE',
            body: clusterData,

            actionDescription: "delete cluster"
        }

        let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))

        console.log(promiseJson)
        const setState = this.setState.bind(this)
        await getAllUserClusters(this.props, setState)

        // this.props.history.push("/private/area")
        this.setState({loading: false, loadingMessage: ""})
    }
    deleteFile = (S3uniqueName: string, fileId?: number) => {
        if (fileId === undefined) {
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

        const params = {Bucket: config.AWS.S3.bucketName, Key: S3uniqueName};

        var localThis = this
        s3.deleteObject(params, function (err, data) {
            if (err) {
                alert("Cannot delete this file from S3 bucket!")
                console.log(err, err.stack);
            } else {
                console.log();
                //alert("File has been deleted from the cloud.")
                localThis.deleteFilePermanently(fileId)
            }
        })
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
        }).catch(error => alert("ERROR: " + error))
    }
    deleteUser = async () => {
        this.setState({loading: true, loadingMessage: "Deleting your account"})
        const {authToken} = this.props;

        const fetchParams: FetchParams = {
            url: '/files',
            token: authToken,
            method: 'GET',

            actionDescription: "load all user files to delete them"
        }
        let files = await getAllUserFiles(authToken, fetchParams)

        //
        // let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
        // console.log(promiseJson)
        // let files = promiseJson['items'].map((item: any, i: number) => {
        //     return {
        //         id: item['SK']['S'],
        //         name: item['Name']['S'],
        //         S3uniqueName: item['S3uniqueName']['S'],
        //         cloud: item['Cloud']['S'],
        //         uploadedBy: item['UploadedBy']['S'],
        //         ownedBy: item['OwnedBy']['S'],
        //         sizeOfFile_MB: item['SizeOfFile_MB']['N'],
        //         tagsKeys: item['TagsKeys']['SS'],
        //         tagsValues: item['TagsValues']['SS']
        //     }
        // })
        for (const file of files) {
            this.deleteFile(file.S3uniqueName, file.id)
        }


        for (const cluster of this.state.clusters) {
            await this.deleteCluster(cluster.clusterId)
        }

        const cognito = new CognitoService();
        let promiseOutput: any = await cognito.deleteUser(this.props.authToken)
        if (promiseOutput.success) {
            console.log("Cognito user successfully deleted: " + promiseOutput.msg)
            this.props.history.push("/")
            //delete user
            const {authToken} = this.props;

            let fetchParams: FetchParams = {
                url: '/users',
                token: authToken,
                method: 'DELETE',

                actionDescription: "delete the user"
            }

            let promiseJson: any = await makeFetch<any>(fetchParams).catch(error => alert("ERROR: " + error))
            console.log(promiseJson)

            await this.props.clearStore()
        } else {
            console.log("ERROR WITH DELETING COGNITO USER: " + promiseOutput.msg)
            return
        }


    }
    logout = async () => {
        await this.props.clearStore()
        this.props.history.push("/")
    }


    makeAdminQuery = () => {
        if (this.state.queryToDB === '') {
            return
        }

        const data = {
            query: this.state.queryToDB
        }
        const {authToken} = this.props;

        const fetchParams: FetchParams = {
            url: '/admin',
            token: authToken,
            method: 'POST',
            body: data,

            actionDescription: "admin query"
        }

        makeFetch<string>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            // @ts-ignore
            this.setState({dbResponse: JSON.stringify(jsonRes['response'])})
        }).catch(error => alert("ERROR: " + error))
    }
    //^
    //to use async: async deleteUser() NOT arrow function!!!

    _onChangeClusterName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newClusterName: (e.target as HTMLInputElement).value})
    }
    _onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({queryToDB: (e.target as HTMLInputElement).value})
    }

    handleTableClick = () => {

    }


    // @ts-ignore
    AdminPanel = ({isAdmin}) => (
        <div className="AdminPanel">
            {isAdmin ? <Form.Group controlId="adminPanel">
                <Form.Label>Query to Database</Form.Label>
                <Form.Control as="textarea" onChange={this._onChangeQuery} type="string" placeholder="Query"/>
                <Button onClick={this.makeAdminQuery} variant="primary">Make request</Button>

                <Form.Label>Response</Form.Label>
                <Form.Control as="textarea" value={this.state.dbResponse}/>
            </Form.Group> : ''}
        </div>
    );

    renderUsedStorageSize = () => {
        if(this.state.usedStorageSize < 0){
            return "loading..."
        }
        return (Math.round((this.state.usedStorageSize + Number.EPSILON) * 100) / 100).toString() + " MB"
    }

    render() {
        if(this.state.loading) {
            return (
                <LoadingScreen loadingMessage={this.state.loadingMessage}/>
            )
        }




        let counter = 0;

        // this.getUserRole()  <---- watch this, the page will have the 401 error, and immediately after that, everything will work
        //this is because of the state being changed with the first function getToken!!!
        const PersonalPage = (

            (this.state.userRole === 'NO_ROLE') ?
                <div>
                    <Test authToken={this.props.authToken}/>
                    Please login.<br/>
                    ERROR 403<br/>
                </div>
                :

                <div>
                    {/*Your user id is: "{this.state.userId}".<br/>*/}

                    <Button onClick={() => this.logout()} variant="danger">Logout</Button> <br/>

                    <Container>
                        <Row>
                            <Col>Your role is: "{this.state.userRole}".<br/></Col>
                        </Row>
                        <Row>
                            Your current used storage size is {this.renderUsedStorageSize()}.
                        </Row>
                        <Row>
                            <Col>
                                <LinkContainer to="/private/searchFiles">
                                    <Button variant="info">My files</Button>
                                </LinkContainer>
                            </Col>
                            <Col>
                                {/*<Test authToken={this.props.authToken}/>*/}
                            </Col>
                        </Row>
                        <Row>
                            <Form.Group controlId="ClusterName">
                                <Form.Label>Cluster Name</Form.Label>
                                <Form.Control onChange={this._onChangeClusterName} type="string" placeholder="Cluster name"/>
                            </Form.Group>
                            <br/>
                            <Button onClick={this.createCluster} variant="primary">Create Cluster</Button>
                        </Row>
                        <Row>
                            <this.AdminPanel isAdmin={this.state.userRole === "ADMINISTRATOR"}/>
                        </Row>
                        <Row>
                            <LinkContainer to="/private/sharedWithMeClusters">
                                <Button variant="info">See shared with me clusters</Button>
                            </LinkContainer>
                        </Row>
                    </Container>

                    <Table striped bordered hover variant="dark">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Cluster</th>
                            <th>Name</th>
                            <th>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.clusters.map(
                            (cluster: Cluster) =>
                                <tr onClick={this.handleTableClick}>
                                    <td key={counter}>
                                        {counter++}
                                    </td>
                                    <td>
                                        <LinkContainer
                                            to={{pathname: '/private/clusters/' + encodeURIComponent(cluster.clusterId!),}}>
                                            <Button variant="info">See</Button>
                                        </LinkContainer>
                                    </td>
                                    <td>
                                        {cluster.name}
                                    </td>
                                    <td>
                                        <Button onClick={() => this.deleteCluster(cluster.clusterId)}
                                                variant="danger">X</Button>
                                    </td>
                                </tr>
                        )}

                        </tbody>
                    </Table>

                    <Button onClick={() => this.deleteUser()} variant="danger">DELETE THIS ACCOUNT</Button> <br/>
                </div>

        )


        return (
            PersonalPage
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(PersonalPage);
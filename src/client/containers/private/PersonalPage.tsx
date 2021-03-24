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
import {Cluster, FileMetadata} from "../../../interfaces/databaseTables";
import config from "../../../config";
import * as AWS from "aws-sdk";
import {AWSError} from "aws-sdk";
import {History} from "history";
import CognitoService from "../../../services/cognito.service";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import {DeleteObjectOutput} from "aws-sdk/clients/s3";
import * as tokensService from "../../../store/demo/tokens.service";
import Test from "../Test";

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


    // constructor(props: ReduxType) {
    //     super(props);
    //     //alert(props)
    // }


    async componentDidMount() {
        await this.getAuthToken()
        this.getUserRole()
        // await this.props.loadStore()
        // await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))

        // await this.getUserRole()
    }

    //Initialization functions
    //getAuthToken = (callback: (next:any) => void) => {
    async getAuthToken(){

        // console.log(window.location.search.substring(1)); // should print "param1=value1&param2=value2...."
        //let id_token_param = window.location.search.substring(1); !!!! //access_token=...
        //var id_token = id_token_param.substring(id_token_param.indexOf('=')+1);//only token after '='(...)
        //id_token = id_token.split('&')[0]


        //hash:
        let token_params = window.location.hash.slice(1);
        let token_params_arr = token_params.split('&');
        let access_token = token_params_arr[0].substring(token_params_arr[0].indexOf('=')+1)

        if (access_token === ''){
            //alert('loading store')
            await this.props.loadStore()          //ASYNC ACTION!!!!! (If you remove await - further code in this function wont have the token loaded from the store!!
            // alert("!!!! AFTER LOADING: " + this.props.authToken)
             //IGNORED (Home/PersonalPage/=> refresh)
        } else {
            await this.props.setAuthToken(access_token)
            await this.props.saveStore()    //ASYNC ACTION!!!!! (If you remove await - further code in this function wont have the new saved store with the token!!
            // alert('set new auth token')
            // this.getUserRole(access_token)
        }


        //var token = id_token_param.substring(id_token_param.indexOf('#')+1);
        //alert(token); str.split('+')[0]
        // const fetchParams: FetchParams = {
        //     url: config.AppConfig.endpoint + '/test',
        //     token: access_token,
        //     method: 'POST',
        //     body: '',
        //
        //     actionDescription: "test request to api gateway"
        // }
        //
        // makeFetch<any>(fetchParams).then(jsonRes => {
        //     console.log(jsonRes)
        // }).catch(error => alert("ERROR: " + error))
    }
    getUserRole = () => {
        const { authToken } = this.props
        //alert(this.props.authToken)
        if (authToken === '') {
            alert('token is empty')
            return
        }
        let clusterData: Cluster = {
            name: this.state.newClusterName,
            ownerUserId: this.state.userId,
        }


        let fetchParams: FetchParams = {
            //url: '/users/find?userId=' + this.state.userId,
            url: '/users',
            token: authToken,
            method: 'POST',
            body: clusterData,

            actionDescription: "get user to set his role"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            //alert(JSON.stringify(jsonRes));
            this.setState({userRole: jsonRes['role']})
            this.getAllUserClusters()
            this.getUsedStorageSize()
        })
            .catch(error => alert("ERROR: " + error))
    }
    getUsedStorageSize = () => {
        alert('get used storage size')
        const { authToken } = this.props;

        let fetchParams: FetchParams = {
            url: '/files/?calcUsedSize=1',
            token: authToken,
            method: 'GET',

            actionDescription: "get used storage size"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            // if (jsonRes['usedStorageSize'] == null)
            //     this.setState({usedStorageSize: 0})
            //else this.setState({usedStorageSize: jsonRes['usedStorageSize']})
            this.setState({usedStorageSize: jsonRes['usedStorageSize']})
        }).catch(error => alert("ERROR: " + error))
    }
    //^


    //Request functions:
    getAllUserClusters = () => {
        alert('get user clusters')
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

            this.setState({clusters: jsonRes['items'].map((item:any, i:number) => {return {clusterId: item['ID']['S'], name: item['name']['S']}})})
        }).catch(error => alert("ERROR: " + error))
    }

    createCluster = () => {

        let clusterData: Cluster = {
            name: this.state.newClusterName
        }

        const { authToken } = this.props;

        const fetchParams: FetchParams = {
            url: '/clusters',
            token: authToken,
            method: 'POST',
            body: clusterData,
            actionDescription: "create cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.getAllUserClusters()
        }).catch(error => alert("ERROR: " + error))
    }
    deleteCluster = (clusterId: number | undefined) => {

        const { authToken } = this.props;

        //delete cluster
        let clusterData: Cluster = {
            clusterId: clusterId
        }

        let fetchParams = {
            url: '/clusters/delete',
            //authToken: authToken,
            //idToken: idToken,
            token: authToken,
            method: 'DELETE',
            body: clusterData,

            actionDescription: "delete cluster"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.getAllUserClusters()
        }).catch(error => alert("ERROR: " + error))


        this.props.history.push("/private/area")
    }
    deleteUser = () => {

        for (const cluster of this.state.clusters) {
            this.deleteCluster(cluster.clusterId)
        }

        const cognito = new CognitoService();
        cognito.deleteUser(this.props.authToken)
            .then(promiseOutput => {
                if (promiseOutput.success) {
                    console.log("Cognito user successfully deleted: " + promiseOutput.msg)
                    // @ts-ignore
                    //userCognitoId = promiseOutput.msg.UserSub
                } else {
                    console.log("ERROR WITH DELETING COGNITO USER: " + promiseOutput.msg)
                    return
                }
            });

        //delete user
        const { authToken } = this.props;

        let fetchParams: FetchParams = {
            url: '/users/delete',
            token: authToken,
            method: 'DELETE',
            body: '',

            actionDescription: "delete user"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.props.history.push("/")
        }).catch(error => alert("ERROR: " + error))
    }

    makeAdminQuery = () => {
        if (this.state.queryToDB === '') {
            return
        }

        const data = {
            query: this.state.queryToDB
        }
        const { authToken } = this.props;

        const fetchParams: FetchParams = {
            url: '/admin',
            token: authToken,
            method: 'POST',
            body: data,

            actionDescription: "admin query"
        }

        makeFetch<string>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({dbResponse: JSON.stringify(jsonRes[0])})
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
                <Form.Control onChange={this._onChangeQuery} type="string" placeholder="Query"/>
                <Button onClick={this.makeAdminQuery} variant="primary">Make request</Button>

                <Form.Label>Response</Form.Label>
                <Form.Control as="textarea" value={this.state.dbResponse}/>
            </Form.Group> : ''}
        </div>
    );

    render() {
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
                Your role is: "{this.state.userRole}".<br/>
                Your current used storage size is {this.state.usedStorageSize} MB.

                <Test authToken={this.props.authToken}/>
                <Form.Group controlId="ClusterName">
                    <Form.Label>Cluster Name</Form.Label>
                    <Form.Control onChange={this._onChangeClusterName} type="string" placeholder="Cluster name"/>
                </Form.Group>
                <Button onClick={this.createCluster} variant="primary">Create Cluster</Button>

                {/*<Button onClick={this.getAllUserClusters} variant="primary">Update clusters</Button>*/}

                <this.AdminPanel isAdmin={this.state.userRole === "ADMINISTRATOR"}/>

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
                        (cluster: Cluster) => <LinkContainer to={{
                            pathname: '/private/clusters/' + cluster.clusterId,
                        }}>
                            <tr onClick={this.handleTableClick}>
                                <td key={counter}>
                                    {counter++}
                                </td>
                                <td>
                                    {cluster.name}
                                </td>
                                <td>
                                    <Button onClick={() => this.deleteCluster(cluster.clusterId)} variant="danger">X</Button>
                                </td>
                            </tr>
                        </LinkContainer>
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
import * as React from "react";

import {connect} from 'react-redux';
import {IRootState} from '../../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../../store/demo/store.service'
import {DemoActions} from '../../../store/demo/types';
import {Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Permission} from "../../../interfaces/databaseTables";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import LoadingScreen from "../../components/LoadingScreen";

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

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    permissions: Permission[]
    loading: boolean
    loadingMessage: string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        permissions: [],
        loading: false,
        loadingMessage: ''
    }

    async componentDidMount() {
        this.setState({loading: true, loadingMessage: "Loading shared with you clusters"})
        try {
            await this.props.loadStore()

            //await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
            await this.getAllSharedClusters()
        } catch (e) {
            this.setState({loading: false, loadingMessage: ""})
        }
        this.setState({loading: false, loadingMessage: ""})
    }

    getAllSharedClusters = () => {

        const {authToken} = this.props;

        let fetchParams: FetchParams = {
            url: '/permissions?action=getUserPermissions',
            token: authToken,
            method: 'GET',

            actionDescription: "get all user permissions"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            this.setState({
                permissions: jsonRes['items'].map((item: any, i: number) => {
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
            })

        }).catch(error => alert("ERROR: " + error))
    }

    handleTableClick = () => {

    }

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        if(this.state.loading) {
            return (
                <LoadingScreen loadingMessage={this.state.loadingMessage}/>
            )
        }




        var counter = 0

        const PersonalPage = (
            <div>
                Shared with you clusters:<br/>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
                        {/*<th>Permissions</th> TODO: parse permissions string*/}
                        <th>Owned by</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.permissions.map(
                        (permissionInfo: Permission) => <LinkContainer to={{
                            pathname: '/private/clusters/' + encodeURIComponent(permissionInfo.clusterId),
                        }}>
                            <tr onClick={this.handleTableClick}>
                                <td key={counter}>
                                    {counter++}
                                </td>
                                <td>
                                    {permissionInfo.clusterName}
                                </td>
                                <td>
                                    {permissionInfo.clusterOwnerUserName}
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
import * as React from "react";

import {connect} from 'react-redux';
import {IRootState} from '../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../store/demo/store.service'
import {DemoActions} from '../../store/demo/types';
import {Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Cluster} from "../../interfaces/databaseTables";
import {decodeIdToken} from "../../interfaces/user";
import {FetchParams, makeFetch} from "../../interfaces/FetchInterface";

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
    clusters: Cluster[]
    userId: string
    userRole: string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        clusters: [],
        userId: '',
        userRole: 'NO_ROLE',
    }

    constructor(props: ReduxType) {
        super(props);
    }

    async componentDidMount() {
        await this.props.loadStore()

        await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
        await this.getAllSharedClusters()
        await this.getUserRole()
    }

    getUserRole = () => {
        if (this.state.userId == '') {
            return
        }

        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/users/find?userId=' + this.state.userId,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
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

    getAllSharedClusters = () => {
        if (this.state.userId == '') {
            return
        }

        const { authToken, idToken, loading} = this.props;

        let fetchParams: FetchParams = {
            url: '/cousers/findAll?userId=' + this.state.userId,
            //authToken: authToken,
            //idToken: idToken,
            token: "",
            method: 'GET',
            body: null,

            actionDescription: "get all co-users"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            console.log("ALL SHARED CLUSTERS: ")
            console.log(jsonRes)
            this.setState({clusters: jsonRes})

            let data = {
                clusterIds: this.state.clusters.map(
                    (l: Cluster) => l.clusterId)
            }

            const {authToken, idToken, loading} = this.props;

            const fetchParams: FetchParams = {
                url: '/clusters/findAll',
                //authToken: authToken,
                //idToken: idToken,
                token: "",
                method: 'POST',
                body: data,

                actionDescription: "get names of shared clusters"
            }

            makeFetch<Cluster[]>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                this.setState({clusters: jsonRes})
            }).catch(error => alert("ERROR: " + error))

        }).catch(error => alert("ERROR: " + error))

    }

    handleTableClick = () => {

    }

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        var counter = 0

        const PersonalPage = (
            <div>
                Your role is: "{this.state.userRole}".<br/>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
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
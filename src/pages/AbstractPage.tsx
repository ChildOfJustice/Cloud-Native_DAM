import * as React from "react";
import {connect} from 'react-redux';
import {IRootState} from '../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../store/demo/store.service'
import {DemoActions} from '../../store/demo/types';
import AuthMiddleware from "../../middleware/auth.middleware";
import config from "../../../util/config";
import * as jwkToPem from "jwk-to-pem";
import {decodeIdToken} from "../../interfaces/user";

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
    userId: string
}


class AbstractPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        userId: '',
    }

    constructor(props: ReduxType) {
        super(props);
    }

    async componentDidMount() {
        await this.props.loadStore()

        await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
    }


    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        return (
            <div></div>
        )
    }


}

export default connect(mapStateToProps, mapDispatcherToProps)(AbstractPage);
import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../store';
import {Dispatch} from 'redux';
import * as tokensService from '../../store/demo/tokens.service'
import * as storeService from '../../store/demo/store.service'
import {DemoActions} from '../../store/demo/types';

import {History} from 'history';
import {FetchParams, makeFetch} from "../../interfaces/FetchInterface";

const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}


//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        setAuthToken: (token: string) => tokensService.setAuthToken(dispatch, token),
        setIdToken: (token: string) => tokensService.setIdToken(dispatch, token),
        loadStore: () => storeService.loadStore(dispatch),
        saveStore: () => storeService.saveStore(dispatch),
    }
}

interface IProps {
    history: History
    /* other props for ChildComponent */
}

type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    username: string
    password: string
}


class SignIn extends React.Component<ReduxType, IState> {
    public state: IState = {
        username: '',
        password: '',
    }

    constructor(props: ReduxType) {
        super(props);

    }

    componentDidMount() {
        this.props.loadStore()
    }

    signIn = (event: any) => {
        event.preventDefault()

        const {username, password} = this.state;

        let userData = {
            username: username,
            password: password,
        }



        const fetchParams: FetchParams = {
            url: '/auth/signIn',
            //authToken: "",
            //idToken: "",
            token: "",
            method: 'POST',
            body: userData,

            actionDescription: "sign in"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            console.log("JSON res: " + jsonRes.data.AuthenticationResult)
            // @ts-ignore


            // @ts-ignore
            this.props.setAuthToken(jsonRes.data.AuthenticationResult.AccessToken)
            this.props.setIdToken(jsonRes.data.AuthenticationResult.IdToken)
            this.props.saveStore()
            // @ts-ignore
            const {authToken, loading} = this.props;

            //alert("Your access token is: " + authToken)
            this.props.history.push("/private/area")
            // if(res.ok)
            //     alert("Successfully signed in")
            // else alert("Error, see logs for more info")
        }).catch(error => alert("ERROR: " + error))



        //.catch(error => alert("Fetch error: " + error))

        //browserHistory.push('/home');
    }

    // getAllNodesFromDB = (event: any) => {
    //     event.preventDefault()
    //
    //
    //     fetch('/files/metadata/findAll?username=TEST_USER', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //             // 'Content-Type': 'application/x-www-form-urlencoded',
    //         }
    //     })
    //         .then(res => {
    //             console.log(res)
    //             res.json().then(jsonRes => {
    //                 console.log(jsonRes)
    //             })
    //
    //             if (res.ok)
    //                 alert("Successfully get all nodes from db")
    //             else alert("Error, see logs for more info")
    //         })
    //         .catch(error => alert("Fetch error: " + error))
    // }
    //
    // makeRequest = (event: any) => {
    //     event.preventDefault()
    //
    //     // @ts-ignore
    //     const {authToken, idToken, loading} = this.props;
    //
    //
    //     fetch('/protected/secret', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Auth': authToken,
    //             'Identity': idToken
    //             // 'Content-Type': 'application/x-www-form-urlencoded',
    //         }
    //     })
    //         .then(res => {
    //             console.log(res)
    //             res.json().then(jsonRes => {
    //                 console.log(jsonRes)
    //             })
    //
    //             if (res.ok)
    //                 alert("Successfully get the secret")
    //             else alert("Error, see logs for more info")
    //         })
    //         .catch(error => alert("Fetch error: " + error))
    // }

    _onChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({username: (e.target as HTMLInputElement).value})
    }

    _onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({password: (e.target as HTMLInputElement).value})
    }

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        const {authToken, loading} = this.props;

        const signInPage = (
            <Form>
                <div style={{margin: '20px'}}>
                    {/*<button onClick={this.makeRequest}>Make a request to secret page</button>*/}
                    {/*<button onClick={this.getAllNodesFromDB}>Get all notes from DB</button>*/}
                    {/*{loading && <div>Loading...</div>}*/}
                    <ul>
                        {/*your auth token is: "{authToken}"*/}
                    </ul>
                </div>


                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeUserName} type="string" placeholder="Your username"/>
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={this._onChangePassword} type="password" placeholder="Password"/>
                </Form.Group>

                <Button onClick={this.signIn} variant="primary" type="submit">Sign In</Button>
            </Form>
        )


        return (
            signInPage

        )
    }


}

export default connect(mapStateToProps, mapDispatcherToProps)(SignIn);
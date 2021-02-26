import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Navbar from "react-bootstrap/Navbar";
import { LinkContainer } from 'react-router-bootstrap';

import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Home from "./Home"
import Test from "./Test"

import UploadFile from "./private/UploadFile";
import PersonalPage from "./private/PersonalPage";
import ClusterOverview from "./private/ClusterOverview";
import SharedWithMeClusters from "./private/SharedWithMeClusters";

class App extends React.Component {

    // componentDidMount() {
    //     let cognitoRole1: CognitoRole = {
    //         cognito_user_group: "Admin",
    //         role: "ADMINISTRATOR"
    //     }
    //
    //     fetch('/cognitoRoles/create',{
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //             // 'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //         body: JSON.stringify(cognitoRole1)
    //     })
    //         .then(res => {
    //             let response_ = res.json()
    //             console.log(response_)
    //             if(res.ok) {
    //                 //alert("Successfully signed you up")
    //             }
    //             else alert("Error with DB INITIALIZATION 1, see logs for more info")
    //         })
    //         .catch(error => console.log("Fetch error: " + error))
    //     //^
    //     let cognitoRole2: CognitoRole = {
    //         cognito_user_group: "User",
    //         role: "ORDINARY_USER"
    //     }
    //     fetch('/cognitoRoles/create',{
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //             // 'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //         body: JSON.stringify(cognitoRole2)
    //     })
    //         .then(res => {
    //             let response_ = res.json()
    //             console.log(response_)
    //             if(res.ok) {
    //                 //alert("Successfully signed you up")
    //             }
    //             else alert("Error with DB INITIALIZATION 2, see logs for more info")
    //         })
    //         .catch(error => console.log("Fetch error: " + error))
    //     //^
    //     console.log("I WAS HERE!!!")
    // }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        const App = () => (
            <div>
                <Navbar bg="light">
                    <LinkContainer to="/">
                        <Navbar.Brand>Home</Navbar.Brand>
                    </LinkContainer>
                    <LinkContainer to="/private/area">
                        <Navbar.Brand>Personal page</Navbar.Brand>
                    </LinkContainer>
                </Navbar>
                <Container className="p-3">
                    <Switch>
                        <Route exact path='/' component={Home}/>
                        <Route exact path='/private/clusters/:clusterId' component={ClusterOverview}/>
                        <Route path='/private/area' component={PersonalPage}/>
                        <Route path='/private/sharedWithMeClusters' component={SharedWithMeClusters}/>
                        <Route path='/private/uploadFile/:clusterId' component={UploadFile}/>
                        <Route path='/signIn' component={SignIn} />
                        <Route path='/signUp' component={SignUp}/>
                        <Route path='/test' component={Test}/>
                    </Switch>
                </Container>
            </div>
        );

        return (
            <Switch>
                <App/>
            </Switch>
        );
    }
}

export default App;
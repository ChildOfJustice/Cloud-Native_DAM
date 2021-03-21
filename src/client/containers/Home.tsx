import Jumbotron from "react-bootstrap/Jumbotron";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import * as React from "react";

interface IProps {
    params: string;
}

interface IState {}

class Home extends React.Component<IProps, IState> {

    render() {
        return (
            <Jumbotron>
                <h1>Welcome!</h1>
                <p>
                    This is Cloud-Native DAM System.
                </p>
                <p>
                    Feel free to test our service.
                </p>
                <p>
                    <LinkContainer to="/signIn">
                        <Button variant="primary">Login</Button>
                    {/*TODO Implement redirection to the UI from Cognito*/}
                    </LinkContainer>

                    {/*<LinkContainer to="/test">*/}
                    {/*    <Button variant="primary">Test</Button>*/}
                    {/*</LinkContainer>*/}
                </p>
            </Jumbotron>
        );
    }
}

export default Home;
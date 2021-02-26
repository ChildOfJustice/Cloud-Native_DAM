import Jumbotron from "react-bootstrap/Jumbotron";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import * as React from "react";

// eslint-disable-next-line react/display-name,@typescript-eslint/explicit-module-boundary-types
export default () => {
    return (
        <Jumbotron>
            <h1>Welcome!</h1>
            <p>
                This is Universal File Share System.
            </p>
            <p>
                Feel free to test our service! ;p
            </p>
            <p>
                <LinkContainer to="/signIn">
                    <Button variant="primary">Sign In</Button>
                </LinkContainer>
                <LinkContainer to="/signUp">
                    <Button variant="primary">Sign Up</Button>
                </LinkContainer>
                {/*<LinkContainer to="/test">*/}
                {/*    <Button variant="primary">Test</Button>*/}
                {/*</LinkContainer>*/}
            </p>
        </Jumbotron>
    );
}
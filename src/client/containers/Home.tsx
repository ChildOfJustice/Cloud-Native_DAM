import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import * as React from "react";
import config from "../../config";

interface IProps {
    params: string;
}

interface IState {
}

class Home extends React.Component<IProps, IState> {


    loginButtonClickHandler = (e: any) => {
        e.preventDefault()
        window.location.href = config.AppConfig.loginURL
    }


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
                    <Button onClick={this.loginButtonClickHandler} variant="primary">Login</Button>

                    {/*<LinkContainer to="/test">*/}
                    {/*    <Button variant="primary">Test</Button>*/}
                    {/*</LinkContainer>*/}
                </p>
            </Jumbotron>
        );
    }
}

export default Home;
import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import * as React from "react";
import config from "../../config";
import {Alert, Carousel} from "react-bootstrap";
import LoadingScreen from "../components/LoadingScreen";


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
            <div>
                <Jumbotron>
                    <Alert variant="success">
                        <Alert.Heading>Welcome!</Alert.Heading>
                        <p>
                            This is Cloud-Native DAM System.
                        </p>
                        <hr />
                        <p className="mb-0">
                            Feel free to test our service.
                        </p>
                        <p>
                            <Button onClick={this.loginButtonClickHandler} variant="primary">Login</Button>
                        </p>
                    </Alert>
                </Jumbotron>
            </div>
        );
    }
}

export default Home;
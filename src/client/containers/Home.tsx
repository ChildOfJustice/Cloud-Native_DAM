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

        const divStyle = {
            // color: 'blue',
            // backgroundImage: 'url(' + imgUrl + ')',
            border: "16px solid #f3f3f3", /* Light grey */
            "border-top": "16px solid #3498db", /* Blue */
            "border-radius": "50%",
            width: "120px",
            height: "120px",
            animation: "spin 2s linear infinite",

            // '@keyframes spin': {
            //     '0%': {
            //         transform: 'rotate(0deg)',
            //     },
            //     '100%': {
            //         transform: 'rotate(360deg)',
            //     },
            // }
        };
        // const loader = document.querySelector('.loader');
        return (
            <Jumbotron>

                {/*<div style={divStyle}></div>*/}
                <div className="loader"></div>

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
import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {LinkContainer} from "react-router-bootstrap";
import {API} from "aws-amplify";
import {FetchParams, makeFetch} from "../interfaces/FetchInterface";

function getData(token: string) {
    const apiName = "MyBlogPostAPI";
    const path = "/$default/$default";
    const myInit = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token
        }
    };
    return API.get(apiName, path, myInit);
}

export default class Test extends React.Component {
    // Initialize the state
    constructor(props: Readonly<{}>){
        super(props);
        this.state = {
            msg: ''
        }
    }
    // Fetch the text on first mount
    componentDidMount() {
        this.getText();
    }
    // Retrieves the list of items from the Express app
    getText = () => {
        fetch('/api/test')
            .then(res => res.json())
            .then(msg => this.setState({ msg }))
    }



    testCode = (event: any) => {
        const fetchParams: FetchParams = {
            url: 'https://hgc931nd9g.execute-api.eu-central-1.amazonaws.com',
            //authToken: "",
            //idToken: "",
            token: "",
            method: 'GET',
            body: '',

            actionDescription: "test request to api gateway"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
        }).catch(error => alert("ERROR: " + error))
    }

    render() {
        // @ts-ignore
        //const { msg } = this.state;
        return (
            <div>

                Test buttons:<br/>

                <Button onClick={this.testCode} variant="primary" type="submit">Test</Button>
            </div>
        );
    }
}
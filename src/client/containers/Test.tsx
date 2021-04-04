import * as React from "react";
import Button from "react-bootstrap/Button";
import {FetchParams, makeFetch} from "../../interfaces/FetchInterface";

interface IProps {
    //history: History
    authToken: string
    /* other props for ChildComponent */
}

interface IState {

}

export default class Test extends React.Component<IProps, IState> {
    // Initialize the state
    constructor(props: IProps) {
        super(props);
        this.state = {
            msg: ''
        }
    }

    // Fetch the text on first mount
    componentDidMount() {
        //this.getText();

    }

    // Retrieves the list of items from the Express app
    getText = () => {
        fetch('/api/test')
            .then(res => res.json())
            .then(msg => this.setState({msg}))
    }


    testCode = (event: any) => {
        const fetchParams: FetchParams = {
            url: '/test',
            //authToken: "",
            //idToken: "",
            token: this.props.authToken,
            method: 'GET',

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
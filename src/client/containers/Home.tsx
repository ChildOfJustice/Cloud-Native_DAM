import Jumbotron from "react-bootstrap/Jumbotron";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import * as React from "react";
import {API} from "aws-amplify";
import {FetchParams, makeFetch} from "../../interfaces/FetchInterface";
import config from "../../config";
import Test from "./Test";

interface MyViewProperties {
    params: string;
}

interface MyViewState {}

class Home extends React.Component<MyViewProperties, MyViewState> {

    render() {


        // fetch(, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Auth': fetchParams.authToken,
        //         'Identity': fetchParams.idToken
        //     }
        // }).then( r => console.log(r))
        //

        // getData(id_token).then(r => {
        //     alert(r)
        //     console.log(r)
        // })
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
}

// eslint-disable-next-line react/display-name,@typescript-eslint/explicit-module-boundary-types
export default Home;

// () => {
//     var smth = useProps()
//     return (
//         <Jumbotron>
//             <h1>Welcome!</h1>
//             <p>
//                 This is Universal File Share System.
//             </p>
//             <p>
//                 Feel free to test our service! ;p
//             </p>
//             <p>
//                 <LinkContainer to="/signIn">
//                     <Button variant="primary">Sign In</Button>
//                 </LinkContainer>
//                 <LinkContainer to="/signUp">
//                     <Button variant="primary">Sign Up</Button>
//                 </LinkContainer>
//                 {/*<LinkContainer to="/test">*/}
//                 {/*    <Button variant="primary">Test</Button>*/}
//                 {/*</LinkContainer>*/}
//             </p>
//         </Jumbotron>
//     );
// }
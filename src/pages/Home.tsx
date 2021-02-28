import Jumbotron from "react-bootstrap/Jumbotron";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import * as React from "react";
import {API} from "aws-amplify";

function getData(token: string) {
    const apiName = "MyBlogPostAPI";
    const path = "/Dev/blog";
    const myInit = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token
        }
    };
    return API.get(apiName, path, myInit);
}



interface MyViewProperties {
    params: string;
}

interface MyViewState {}

class Home extends React.Component<MyViewProperties, MyViewState> {

    render() {

        // console.log(window.location.search.substring(1)); // should print "param1=value1&param2=value2...."
        // alert(window.location.search.substring(1))
        // let code = window.location.search.substring(1) //code
        var id_token_param = window.location.hash.slice(1);
        //var token = id_token_param.substring(id_token_param.indexOf('=')+1);
        var token = id_token_param.substring(id_token_param.indexOf('#')+1);
        var id_token = id_token_param.substring(id_token_param.indexOf('=')+1);
        id_token = id_token.split('&')[0]
        //alert(token); str.split('+')[0]
        getData(id_token).then(r => {
            alert(r)
            console.log(r)
        })
        return (
            <Jumbotron>
                <h1>Welcome!</h1>
                <p>
                    This is Universal File Share System.
                </p>
                <p>
                    Feel free to test our service! ;p
                    {/*YOUR TOKEN IS {getData(token).then(r => alert(r))}*/}
                    OR {}

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
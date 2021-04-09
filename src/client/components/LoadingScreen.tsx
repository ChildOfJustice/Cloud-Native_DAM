import React, {CSSProperties} from 'react'
import {Spinner} from "react-bootstrap";

interface IState {

}

interface IProps {
    loadingMessage: string
}

export default class LoadingScreen extends React.Component<IProps, IState> {

    render() {
        const loadingSpinnerStyle: CSSProperties = {
            // color: 'blue',
            // backgroundImage: 'url(' + imgUrl + ')',
            background: "url(favicon.ico) no-repeat center center",
            border: "16px solid #f3f3f3",
            borderTop: "16px solid #3498db",
            borderBottom: "16px solid #3498db",
            borderRadius: "50%",
            position: "absolute",
            top: "calc(50% - 60px)",
            left: "calc(50% - 60px)",
            width: "120px",
            height: "120px",
            animation: "spin 2s linear infinite"
        }
        const loadingTextStyle: CSSProperties = {
            // color: 'blue',
            // backgroundImage: 'url(' + imgUrl + ')',
            position: "absolute",
            top: "50%",
            left: "50% ",
        }
        // const loader = document.querySelector('.loader');
        return (
            <div>
                <div style={loadingTextStyle}>
                    <h1>{this.props.loadingMessage}...</h1>
                </div>

                <div style={loadingSpinnerStyle}>
                    <div className="loader"/>
                </div>
            </div>
        )
    }
}
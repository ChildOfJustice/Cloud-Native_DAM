import React from 'react'
import {FileMetadata} from "../../interfaces/databaseTables";
import Button from "react-bootstrap/Button";
import {FileOverviewType} from 'src/interfaces/componentsTypes';

interface IState {
    files: FileMetadata[]
}

interface IProps {
    parent: any
    handleCheckChildElement?: (event: any) => void
    handleDownloadFile: (fileKey: string, cloud: string, fileName: string) => void
    handleDeleteFile: (sender: any, S3uniqueName: string, fileId?: number) => void
    value: FileOverviewType
}

export default class CheckBox extends React.Component<IProps, IState> {

    renderFileSize = (fileSize: number) => {
        if (fileSize < 1) {
            return "< 1";
        }
        return Math.round(((+fileSize) + Number.EPSILON) * 100) / 100
    }

    renderCheckBox = () => {
        if(this.props.handleCheckChildElement != null){
            return <td>
                <input key={this.props.value.id} onChange={this.props.handleCheckChildElement} type="checkbox"
                          checked={this.props.value.isChecked} value={this.props.value.id}/>
            </td>
        } else {
            return ""
        }
    }

    render() {
        return (
            <tr>
                <td key={this.props.value.id}>
                    {this.props.value.id}
                </td>

                {this.renderCheckBox()}

                <td>
                    <Button
                        onClick={() => this.props.handleDownloadFile(this.props.value.file.S3uniqueName, this.props.value.file.cloud, this.props.value.file.name)}
                        variant="link">
                        {this.props.value.file.name}
                    </Button>
                </td>
                <td>
                    {this.props.value.file.cloud}
                </td>
                <td>
                    {this.props.value.file.uploadedBy}
                </td>
                <td>
                    {this.props.value.file.ownedBy}
                </td>
                <td>
                    {this.renderFileSize(this.props.value.file.sizeOfFile_MB)}
                </td>
                <table>
                    <tbody>
                        {this.props.value.file.tagsKeys.map((keyName, i) =>
                            (<tr>
                                <td>{keyName}</td>
                                <td>{this.props.value.file.tagsValues[i]}</td>
                            </tr>)
                        )}
                    </tbody>
                </table>
                <td>
                    <Button
                        onClick={() => this.props.handleDeleteFile(this.props.parent, this.props.value.file.S3uniqueName, this.props.value.file.id)}
                        variant="danger">Delete</Button>
                </td>
            </tr>
        )
    }
}
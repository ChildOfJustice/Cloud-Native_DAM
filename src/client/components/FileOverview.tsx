import React from 'react'
import {FileMetadata} from "../../interfaces/databaseTables";
import Button from "react-bootstrap/Button";
import {FileOverviewType} from 'src/interfaces/componentsTypes';

interface IState {
    files: FileMetadata[]
    //searchCriterion
}

interface IProps {
    //file: FileMetadata
    parent: any
    handleCheckChildElement: (event: any) => void
    handleDownloadFile: (fileKey: string, cloud: string, fileName: string) => void
    handleDeleteFile: (sender: any, S3uniqueName: string, fileId?: number) => void
    value: FileOverviewType
}

export default class CheckBox extends React.Component<IProps, IState> {

    render() {
        return (
            <tr>
                <td key={this.props.value.id}>
                    {this.props.value.id}
                </td>
                <td>
                    <input key={this.props.value.id} onChange={this.props.handleCheckChildElement} type="checkbox"
                           checked={this.props.value.isChecked} value={this.props.value.id}/>
                </td>
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
                    {this.props.value.file.sizeOfFile_MB}
                </td>
                <td>
                    {this.props.value.file.tagsKeys.map((keyName: any) => <div>{keyName}</div>)}
                </td>
                <td>
                    {this.props.value.file.tagsValues.map((keyName: any) => <div>{keyName}</div>)}
                </td>
                <td>
                    <Button
                        onClick={() => this.props.handleDeleteFile(this.props.parent, this.props.value.file.S3uniqueName, this.props.value.file.id)}
                        variant="danger">Delete</Button>
                </td>
            </tr>
        )
    }
}